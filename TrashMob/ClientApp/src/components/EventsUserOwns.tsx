import { Component } from 'react';
import * as React from 'react'

import { Link } from 'react-router-dom';
import EventData from './Models/EventData';  
import { getUserFromCache } from '../store/accountHandler';
import EventTypeData from './Models/EventTypeData';
import { apiConfig, msalClient } from '../store/AuthStore';

interface PropsType { };

interface FetchEventDataState {
    eventList: EventData[];
    eventTypeList: EventTypeData[];
    loading: boolean;
    token: string;
}

export class EventsUserOwns extends Component<PropsType, FetchEventDataState> {

    constructor(props: FetchEventDataState) {
        super(props);
        this.state = { eventList: [], eventTypeList: [], loading: true, token: "" };

        const account = msalClient.getAllAccounts()[0];

        var request = {
            scopes: apiConfig.b2cScopes,
            account: account
        };

        msalClient.acquireTokenSilent(request).then(tokenResponse => {
            const headers = new Headers();
            headers.append('Authorization', 'BEARER ' + tokenResponse.accessToken);
            headers.append('Accept', 'application/json, text/plain');
            headers.append('Content-Type', 'application/json');
            headers.append("Allow", 'GET');

            fetch('api/eventtypes', {
                method: 'GET',
                headers: {
                    Allow: 'GET',
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
            })
                .then(response => response.json() as Promise<Array<any>>)
                .then(data => {
                    this.setState({ eventTypeList: data });
                });

            fetch('api/events/eventsowned/' + getUserFromCache().id, {
                method: 'GET',
                headers: headers
            })
                .then(response => response.json() as Promise<EventData[]>)
                .then(data => {
                    this.setState({ eventList: data, loading: false });
                });
        });

        // This binding is necessary to make "this" work in the callback  
        this.handleDelete = this.handleDelete.bind(this);
    }

    // Handle Delete request for an event  
    private handleDelete(id: string, name: string) {
        if (!window.confirm("Do you want to delete event with name: " + name))
            return;
        else {
            const account = msalClient.getAllAccounts()[0];

            var request = {
                scopes: apiConfig.b2cScopes,
                account: account
            };

            msalClient.acquireTokenSilent(request).then(tokenResponse => {
                const headers = new Headers();
                headers.append('Authorization', 'BEARER ' + tokenResponse.accessToken);
                headers.append('Accept', 'application/json, text/plain');
                headers.append('Content-Type', 'application/json');
                headers.append("Allow", 'DELETE');

                fetch('api/Events/' + id, {
                    method: 'delete'
                }).then(data => {
                    this.setState(
                        {
                            eventList: this.state.eventList.filter((rec) => {
                                return (rec.id !== id);
                            })
                        });
                });
            });
        }
    }

    private getEventType(eventTypeId: any): string {
        return this.state.eventTypeList.find(et => et.id === eventTypeId).name;
    }

    public render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderEventsTable(this.state.eventList);

        return (
            <div>
                <h1 id="tabelLabel" >Mob Events</h1>
                <p>
                    <Link to="/createevent">Create Event</Link>
                </p>
                {contents}
            </div>
        );
    }

    private renderEventsTable(events: EventData[]) {
        return (
            <div>
                <table className='table table-striped' aria-labelledby="tabelLabel">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Event Type</th>
                            <th>City</th>
                            <th>Region</th>
                            <th>Country</th>
                            <th>Postal Code</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(mobEvent =>
                            <tr key={mobEvent.id.toString()}>
                                <td>{mobEvent.name}</td>
                                <td>{mobEvent.eventDate}</td>
                                <td>{this.getEventType(mobEvent.eventTypeId)}</td>
                                <td>{mobEvent.city}</td>
                                <td>{mobEvent.region}</td>
                                <td>{mobEvent.country}</td>
                                <td>{mobEvent.postalCode}</td>
                                <td>
                                    <Link to={`/editevent/${mobEvent.id}`}>Edit Event</Link>
                                    <a className="action" onClick={() => this.handleDelete(mobEvent.id, mobEvent.name)}>Delete Event</a>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}
