﻿namespace TrashMobMobile.Views
{
    using TrashMobMobile.ViewModels;
    using Xamarin.Forms;
    using Xamarin.Forms.Xaml;

    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class LoginPage : ContentPage
    {
        public LoginPage()
        {
            InitializeComponent();
            BindingContext = App.GetViewModel<LoginViewModel>();
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();
            
            // TODO This logic should be moved to VM
            var isLoggedIn = await Xamarin.Essentials.SecureStorage.GetAsync("isLogged");

            if (isLoggedIn == "1")
            {
                await Shell.Current.GoToAsync($"//{nameof(MobEventsPage)}");
            }
        }
    }
}