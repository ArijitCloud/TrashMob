﻿namespace TrashMobMobile.Features.LogOn
{
    using Microsoft.Identity.Client;
    using Newtonsoft.Json.Linq;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;
    using TrashMobMobile.Models;
    using TrashMobMobile.Services;
    using Xamarin.Forms;

    /// <summary>
    ///  For simplicity, we'll have this as a singleton. 
    /// </summary>
    public class B2CAuthenticationService : IB2CAuthenticationService
    {
        private readonly IPublicClientApplication _pca;

        private static readonly Lazy<B2CAuthenticationService> lazy = new Lazy<B2CAuthenticationService>
           (() => new B2CAuthenticationService());

        public static B2CAuthenticationService Instance { get { return lazy.Value; } }

        private B2CAuthenticationService()
        {

            // default redirectURI; each platform specific project will have to override it with its own
            var builder = PublicClientApplicationBuilder.Create(B2CConstants.ClientID)
                .WithB2CAuthority(B2CConstants.AuthoritySignInSignUp)
                .WithIosKeychainSecurityGroup(B2CConstants.IOSKeyChainGroup)
                // .WithRedirectUri("http://localhost");
                .WithRedirectUri(B2CConstants.RedirectUri);

            // Android implementation is based on https://github.com/jamesmontemagno/CurrentActivityPlugin
            // iOS implementation would require to expose the current ViewControler - not currently implemented as it is not required
            // UWP does not require this
            var windowLocatorService = DependencyService.Get<IParentWindowLocatorService>();

            if (windowLocatorService != null)
            {
                builder = builder.WithParentActivityOrWindow(() => windowLocatorService?.GetCurrentParentWindow());
            }

            _pca = builder.Build();
        }

        public async Task<UserContext> SignInAsync()
        {
            UserContext newContext;
            try
            {
                // acquire token silent
                newContext = await AcquireTokenSilent();
            }
            catch (MsalUiRequiredException)
            {
                // acquire token interactive
                newContext = await SignInInteractively();
            }

            return newContext;
        }

        public async Task<UserContext> SignInAsync(IUserManager userManager)             
        {
            var userContext = await SignInAsync();

            await VerifyAccount(userContext, userManager);

            return userContext;
        }

        private async Task VerifyAccount(UserContext userContext, IUserManager userManager)
        {
            var user = new User
            {
                Id = Guid.Empty,
                NameIdentifier = userContext.NameIdentifier,
                SourceSystemUserName = userContext.SourceSystemUserName ?? "",
                Email = userContext.EmailAddress ?? ""
            };

            App.CurrentUser = await userManager.AddUserAsync(user);
        }

        private async Task<UserContext> AcquireTokenSilent()
        {
            IEnumerable<IAccount> accounts = await _pca.GetAccountsAsync();
            AuthenticationResult authResult = await _pca.AcquireTokenSilent(B2CConstants.Scopes, GetAccountByPolicy(accounts, B2CConstants.PolicySignUpSignIn))
               .WithB2CAuthority(B2CConstants.AuthoritySignInSignUp)
               .ExecuteAsync();

            var newContext = UpdateUserInfo(authResult);
            return newContext;
        }

        public async Task<UserContext> ResetPasswordAsync(IUserManager userManager)
        {
            AuthenticationResult authResult = await _pca.AcquireTokenInteractive(B2CConstants.Scopes)
                .WithPrompt(Prompt.NoPrompt)
                .WithAuthority(B2CConstants.AuthorityPasswordReset)
                .ExecuteAsync();

            var userContext = UpdateUserInfo(authResult);
            await VerifyAccount(userContext, userManager);

            return userContext;
        }

        public async Task<UserContext> EditProfileAsync()
        {
            IEnumerable<IAccount> accounts = await _pca.GetAccountsAsync();

            AuthenticationResult authResult = await _pca.AcquireTokenInteractive(B2CConstants.Scopes)
                .WithAccount(GetAccountByPolicy(accounts, B2CConstants.PolicyEditProfile))
                .WithPrompt(Prompt.NoPrompt)
                .WithAuthority(B2CConstants.AuthorityEditProfile)
                .ExecuteAsync();

            var userContext = UpdateUserInfo(authResult);

            return userContext;
        }

        private async Task<UserContext> SignInInteractively()
        {
            var useEmbeddedWebview = true;
            try
            {
                // Android implementation is based on https://github.com/jamesmontemagno/CurrentActivityPlugin
                // iOS implementation would require to expose the current ViewControler - not currently implemented as it is not required
                // UWP does not require this
                var windowLocatorService = DependencyService.Get<IParentWindowLocatorService>();

                AuthenticationResult authResult;

                if (windowLocatorService == null)
                {
                    authResult = await _pca.AcquireTokenInteractive(B2CConstants.Scopes)
                                        .WithUseEmbeddedWebView(useEmbeddedWebview)
                                        .ExecuteAsync();
                }
                else
                {
                    authResult = await _pca.AcquireTokenInteractive(B2CConstants.Scopes)
                                        .WithParentActivityOrWindow(windowLocatorService?.GetCurrentParentWindow())
                                        .WithUseEmbeddedWebView(useEmbeddedWebview)
                                        .ExecuteAsync();
                }

                var newContext = UpdateUserInfo(authResult);
                return newContext;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<UserContext> SignOutAsync()
        {

            IEnumerable<IAccount> accounts = await _pca.GetAccountsAsync();
            while (accounts.Any())
            {
                await _pca.RemoveAsync(accounts.FirstOrDefault());
                accounts = await _pca.GetAccountsAsync();
            }

            var signedOutContext = new UserContext
            {
                IsLoggedOn = false
            };
            return signedOutContext;
        }

        private IAccount GetAccountByPolicy(IEnumerable<IAccount> accounts, string policy)
        {
            foreach (var account in accounts)
            {
                string userIdentifier = account.HomeAccountId.ObjectId.Split('.')[0];
                if (userIdentifier.EndsWith(policy.ToLower()))
                {
                    return account;
                }
            }

            return null;
        }

        private string Base64UrlDecode(string s)
        {
            s = s.Replace('-', '+').Replace('_', '/');
            s = s.PadRight(s.Length + (4 - s.Length % 4) % 4, '=');
            var byteArray = Convert.FromBase64String(s);
            var decoded = Encoding.UTF8.GetString(byteArray, 0, byteArray.Count());
            return decoded;
        }

        public UserContext UpdateUserInfo(AuthenticationResult ar)
        {
            var newContext = new UserContext
            {
                IsLoggedOn = false
            };

            JObject user = ParseIdToken(ar.IdToken);

            newContext.NameIdentifier = ar.ClaimsPrincipal?.Claims?.FirstOrDefault(c => c.Type == "sub")?.Value;
            newContext.SourceSystemUserName = ar.ClaimsPrincipal?.Claims?.FirstOrDefault(c => c.Type == "username")?.Value;

            newContext.AccessToken = ar.AccessToken;
            newContext.Name = user["name"]?.ToString();
            newContext.UserIdentifier = user["oid"]?.ToString();

            newContext.GivenName = user["given_name"]?.ToString();
            newContext.FamilyName = user["family_name"]?.ToString();

            newContext.StreetAddress = user["streetAddress"]?.ToString();
            newContext.City = user["city"]?.ToString();
            newContext.Province = user["state"]?.ToString();
            newContext.PostalCode = user["postalCode"]?.ToString();
            newContext.Country = user["country"]?.ToString();

            newContext.JobTitle = user["jobTitle"]?.ToString();

            if (user["emails"] is JArray emails)
            {
                newContext.EmailAddress = emails[0].ToString();
            }

            newContext.IsLoggedOn = true;

            return newContext;
        }

        JObject ParseIdToken(string idToken)
        {
            // Get the piece with actual user info
            idToken = idToken.Split('.')[1];
            idToken = Base64UrlDecode(idToken);
            return JObject.Parse(idToken);
        }
    }
}