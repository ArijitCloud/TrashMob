﻿import * as msal from "@azure/msal-browser";
import { MsalAuthenticationResult, MsalAuthenticationTemplate } from "@azure/msal-react";
import { Guid } from "guid-typescript";
import UserData from "../components/Models/UserData";
import { CurrentPrivacyPolicyVersion } from "../components/PrivacyPolicy";
import { CurrentTermsOfServiceVersion } from "../components/TermsOfService";
import { apiConfig, msalClient } from "./AuthStore";

const user: UserData = {
    id: Guid.createEmpty().toString(),
    dateAgreedToPrivacyPolicy: new Date(),
    dateAgreedToTermsOfService: new Date(),
    memberSince: new Date(),
    privacyPolicyVersion: "",
    tenantId: "",
    termsOfServiceVersion: "",
    uniqueId: "",
    userName: "",
    city: "",
    country: "",
    email: "",
    givenName: "",
    postalCode: "",
    region: "",
    surname: "",
};

export function cacheUser(user: UserData) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

export function getUserFromCache() {
    var userString = localStorage.getItem('currentUser');

    if (userString) {
        return JSON.parse(userString);
    }

    return null;
}

export function verifyAccount(result: msal.AuthenticationResult) {

    const headers = new Headers();
    const bearer = `Bearer ${result.accessToken}`;
    headers.append("Authorization", bearer);
    headers.append("Allow", 'GET');
    headers.append("Accept", 'application/json');
    headers.append("Content-Type", 'application/json');

    user.uniqueId = result.uniqueId;
    user.tenantId = result.tenantId;
    user.userName = result.account?.username ?? "";
    user.city = result.account?.idTokenClaims["city"] ?? "";
    user.country = result.account?.idTokenClaims["country"] ?? "";
    user.postalCode = result.account?.idTokenClaims["postalCode"] ?? "";
    user.givenName = result.account?.idTokenClaims["given_name"] ?? "";
    user.surname = result.account?.idTokenClaims["family_name"] ?? "";
    user.email = result.account?.idTokenClaims["emails"][0] ?? "";

    fetch('api/Users', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(user)
    })
        .then(response => response.json() as Promise<UserData> | null)
        .then(data => {
            if (data) {
                user.id = data.id;
                user.dateAgreedToPrivacyPolicy = data.dateAgreedToPrivacyPolicy;
                user.dateAgreedToTermsOfService = data.dateAgreedToTermsOfService;
                user.memberSince = data.memberSince;
                user.privacyPolicyVersion = data.privacyPolicyVersion;
                user.termsOfServiceVersion = data.termsOfServiceVersion;
                cacheUser(user)
            }

            if (user.dateAgreedToPrivacyPolicy < CurrentPrivacyPolicyVersion.versionDate || user.dateAgreedToTermsOfService < CurrentTermsOfServiceVersion.versionDate || user.termsOfServiceVersion === "" || user.privacyPolicyVersion === "") {
                // todo: fix this so this popup works.
                // return AgreeToPolicies;
            }
        });
}

export function updateAgreements(tosVersion: string, privacyVersion: string) {

    const headers = new Headers();
    headers.append("Allow", 'GET');
    headers.append("Accept", 'application/json');
    headers.append("Content-Type", 'application/json');

    user.dateAgreedToPrivacyPolicy = new Date();
    user.dateAgreedToTermsOfService = new Date();
    user.termsOfServiceVersion = tosVersion;
    user.privacyPolicyVersion = privacyVersion;

    fetch('api/Users', {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(user)
    })
        .then(response => response.json() as Promise<UserData> | null)
        .then(data => cacheUser(data ?? new UserData()));
}

export function clearUserCache() {
    user.id = Guid.createEmpty().toString();
    user.uniqueId = "";
    user.tenantId = "";
    user.userName = "";
    user.dateAgreedToPrivacyPolicy = new Date();
    user.privacyPolicyVersion = "";
    user.dateAgreedToTermsOfService = new Date();
    user.termsOfServiceVersion = "";
    user.memberSince = new Date();
    cacheUser(user);
}
