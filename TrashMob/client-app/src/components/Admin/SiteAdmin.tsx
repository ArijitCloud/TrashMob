import * as React from 'react';
import { ButtonGroup, ToggleButton } from 'react-bootstrap';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { apiConfig, getDefaultHeaders, msalClient } from '../../store/AuthStore';
import EventData from '../Models/EventData';
import PartnerData from '../Models/PartnerData';
import PartnerRequestData from '../Models/PartnerRequestData';
import PartnerRequestStatusData from '../Models/PartnerRequestStatusData';
import UserData from '../Models/UserData';
import WaiverData from '../Models/WaiverData';
import { AdminEvents } from './AdminEvents';
import { AdminPartnerRequests } from './AdminPartnerRequests';
import { AdminPartners } from './AdminPartners';
import { AdminUsers } from './AdminUsers';
import { AdminWaivers } from './AdminWaivers';

interface SiteAdminProps extends RouteComponentProps<any> {
    isUserLoaded: boolean;
    currentUser: UserData;
}

const SiteAdmin: React.FC<SiteAdminProps> = (props) => {

    const [currentUser, setCurrentUser] = React.useState<UserData>(props.currentUser);
    const [isUserLoaded, setIsUserLoaded] = React.useState<boolean>(props.isUserLoaded);
    const [isSiteAdmin, setIsSiteAdmin] = React.useState<boolean>(false);
    const [radioValue, setRadioValue] = React.useState('1');
    const [userList, setUserList] = React.useState<UserData[]>([]);
    const [eventList, setEventList] = React.useState<EventData[]>([]);
    const [partnerList, setPartnerList] = React.useState<PartnerData[]>([]);
    const [waiverList, setWaiverList] = React.useState<WaiverData[]>([]);
    const [partnerRequestList, setPartnerRequestList] = React.useState<PartnerRequestData[]>([]);
    const [isUserDataLoaded, setIsUserDataLoaded] = React.useState<boolean>(false);
    const [isEventDataLoaded, setIsEventDataLoaded] = React.useState<boolean>(false);
    const [isPartnerDataLoaded, setIsPartnerDataLoaded] = React.useState<boolean>(false);
    const [isWaiverDataLoaded, setIsWaiverDataLoaded] = React.useState<boolean>(false);
    const [isPartnerRequestDataLoaded, setIsPartnerRequestDataLoaded] = React.useState<boolean>(false);
    const [partnerRequestStatusList, setPartnerRequestStatusList] = React.useState<PartnerRequestStatusData[]>([]);

    const radios = [
        { name: 'Manage Users', value: '1' },
        { name: 'Manage Events', value: '2' },
        { name: 'Manage Partners', value: '3' },
        { name: 'Manage Partner Requests', value: '4' },
        { name: 'View Executive Summary', value: '5' },
        { name: 'Manage Waivers', value: '6' },
    ];

    React.useEffect(() => {
        setIsSiteAdmin(props.currentUser.isSiteAdmin);
        setCurrentUser(props.currentUser);
        setIsUserLoaded(props.isUserLoaded);

        const account = msalClient.getAllAccounts()[0];

        var request = {
            scopes: apiConfig.b2cScopes,
            account: account
        };

        msalClient.acquireTokenSilent(request).then(tokenResponse => {

            const headers = getDefaultHeaders('GET');
            headers.append('Authorization', 'BEARER ' + tokenResponse.accessToken);

            // Load the User List
            fetch('/api/users', {
                method: 'GET',
                headers: headers,
            })
                .then(response => response.json() as Promise<Array<UserData>>)
                .then(data => {
                    setUserList(data);
                    setIsUserDataLoaded(true);
                });

            // Load the Event List
            fetch('/api/events', {
                method: 'GET',
                headers: headers,
            })
                .then(response => response.json() as Promise<Array<EventData>>)
                .then(data => {
                    setEventList(data);
                    setIsEventDataLoaded(true);
                });

            // Load the Partner List
            fetch('/api/partners', {
                method: 'GET',
                headers: headers,
            })
                .then(response => response.json() as Promise<Array<PartnerData>>)
                .then(data => {
                    setPartnerList(data);
                    setIsPartnerDataLoaded(true);
                });

            // Load the Waiver List
            fetch('/api/waivers', {
                method: 'GET',
                headers: headers,
            })
                .then(response => response.json() as Promise<Array<WaiverData>>)
                .then(data => {
                    setWaiverList(data);
                    setIsWaiverDataLoaded(true);
                });

            // Load the PartnerRequestStatusList
            fetch('/api/partnerrequeststatuses', {
                method: 'GET',
                headers: headers
            })
                .then(response => response.json() as Promise<Array<any>>)
                .then(data => {
                    setPartnerRequestStatusList(data);
                })
                .then(() => {
                    // Load the Partner Request List
                    fetch('/api/partnerrequests', {
                        method: 'GET',
                        headers: headers,
                    })
                        .then(response => response.json() as Promise<Array<PartnerRequestData>>)
                        .then(data => {
                            setPartnerRequestList(data);
                            setIsPartnerRequestDataLoaded(true);
                        });
                });
        });

    }, [props.currentUser, props.currentUser.isSiteAdmin, props.isUserLoaded])

    function loadEvents() {
        const account = msalClient.getAllAccounts()[0];

        var request = {
            scopes: apiConfig.b2cScopes,
            account: account
        };

        msalClient.acquireTokenSilent(request).then(tokenResponse => {

            const headers = getDefaultHeaders('GET');
            headers.append('Authorization', 'BEARER ' + tokenResponse.accessToken);

            // Load the Event List
            fetch('/api/events', {
                method: 'GET',
                headers: headers,
            })
                .then(response => response.json() as Promise<Array<EventData>>)
                .then(data => {
                    setEventList(data);
                    setIsEventDataLoaded(true);
                });
        });
    }

    function loadUsers() {
        const account = msalClient.getAllAccounts()[0];

        var request = {
            scopes: apiConfig.b2cScopes,
            account: account
        };

        msalClient.acquireTokenSilent(request).then(tokenResponse => {

            const headers = getDefaultHeaders('GET');
            headers.append('Authorization', 'BEARER ' + tokenResponse.accessToken);

            // Load the User List
            fetch('/api/users', {
                method: 'GET',
                headers: headers,
            })
                .then(response => response.json() as Promise<Array<UserData>>)
                .then(data => {
                    setUserList(data);
                    setIsUserDataLoaded(true);
                });
        });
    }

    function loadPartners() {
        const account = msalClient.getAllAccounts()[0];

        var request = {
            scopes: apiConfig.b2cScopes,
            account: account
        };

        msalClient.acquireTokenSilent(request).then(tokenResponse => {

            const headers = getDefaultHeaders('GET');
            headers.append('Authorization', 'BEARER ' + tokenResponse.accessToken);

            // Load the Partner List
            fetch('/api/partners', {
                method: 'GET',
                headers: headers,
            })
                .then(response => response.json() as Promise<Array<PartnerData>>)
                .then(data => {
                    setPartnerList(data);
                    setIsPartnerDataLoaded(true);
                });
        });
    }

    function loadWaivers() {
        const account = msalClient.getAllAccounts()[0];

        var request = {
            scopes: apiConfig.b2cScopes,
            account: account
        };

        msalClient.acquireTokenSilent(request).then(tokenResponse => {

            const headers = getDefaultHeaders('GET');
            headers.append('Authorization', 'BEARER ' + tokenResponse.accessToken);

            // Load the Waivers List
            fetch('/api/waivers', {
                method: 'GET',
                headers: headers,
            })
                .then(response => response.json() as Promise<Array<WaiverData>>)
                .then(data => {
                    setWaiverList(data);
                    setIsWaiverDataLoaded(true);
                });
        });
    }

    function loadPartnerRequests() {
        const account = msalClient.getAllAccounts()[0];

        var request = {
            scopes: apiConfig.b2cScopes,
            account: account
        };

        msalClient.acquireTokenSilent(request).then(tokenResponse => {

            const headers = getDefaultHeaders('GET');
            headers.append('Authorization', 'BEARER ' + tokenResponse.accessToken);

            // Load the Partner Request List
            fetch('/api/partnerrequests', {
                method: 'GET',
                headers: headers,
            })
                .then(response => response.json() as Promise<Array<PartnerRequestData>>)
                .then(data => {
                    setPartnerRequestList(data);
                    setIsPartnerRequestDataLoaded(true);
                });
        });
    }

    function renderManageEvents() {
        return (
            <div>
                <AdminEvents history={props.history} location={props.location} match={props.match} eventList={eventList} isEventDataLoaded={isEventDataLoaded} onEventListChanged={loadEvents} currentUser={currentUser} isUserLoaded={isUserLoaded} />
            </div>
        )
    }

    function renderManageUsers() {
        return (
            <div>
                <AdminUsers history={props.history} location={props.location} match={props.match} userList={userList} isUserDataLoaded={isUserDataLoaded} onUserListChanged={loadUsers} currentUser={currentUser} isUserLoaded={isUserLoaded} />
            </div>
        )
    }

    function renderManagePartners() {
        return (
            <div>
                <AdminPartners history={props.history} location={props.location} match={props.match} partnerList={partnerList} isPartnerDataLoaded={isPartnerDataLoaded} onPartnerListChanged={loadPartners} currentUser={currentUser} isUserLoaded={isUserLoaded} />
            </div>
        )
    }

    function renderManageWaivers() {
        return (
            <div>
                <AdminWaivers history={props.history} location={props.location} match={props.match} waivers={waiverList} isWaiverDataLoaded={isWaiverDataLoaded} onWaiverListChanged={loadWaivers} currentUser={currentUser} isUserLoaded={isUserLoaded} />
            </div>
        )
    }

    function renderManagePartnerRequests() {
        return (
            <div>
                <AdminPartnerRequests history={props.history} location={props.location} match={props.match} partnerRequestList={partnerRequestList} isPartnerRequestDataLoaded={isPartnerRequestDataLoaded} partnerRequestStatusList={partnerRequestStatusList} onPartnerRequestListChanged={loadPartnerRequests} currentUser={currentUser} isUserLoaded={isUserLoaded} />
            </div>
        )
    }

    function renderExecutiveSummary() {
        return (
            <div>
                Executive Summary
            </div>
        )
    }

    function renderAdminTable() {
        return (
            <div>
                <ButtonGroup>
                    {radios.map((radio, idx) => (
                        <ToggleButton
                            key={idx}
                            id={`radio-${idx}`}
                            type="radio"
                            variant={idx % 2 ? 'outline-success' : 'outline-danger'}
                            name="radio"
                            value={radio.value}
                            checked={radioValue === radio.value}
                            onChange={(e) => setRadioValue(e.currentTarget.value)}
                        >
                            {radio.name}
                        </ToggleButton>
                    ))}
                </ButtonGroup>

                {radioValue === '1' && renderManageUsers()}
                {radioValue === '2' && renderManageEvents()}
                {radioValue === '3' && renderManagePartners()}
                {radioValue === '4' && renderManagePartnerRequests()}
                {radioValue === '5' && renderExecutiveSummary()}
                {radioValue === '6' && renderManageWaivers()}

            </div>
        );
    }

    return (
        <>
            <h1>Site Administration</h1>
            <div>
                {!isSiteAdmin && <p><em>Access Denied</em></p>}
                {isSiteAdmin && renderAdminTable()}

            </div>
        </>
    )
}

export default withRouter(SiteAdmin);