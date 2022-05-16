import React, { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Redirect, HashRouter
} from 'react-router-dom';

import { useDispatch } from 'react-redux';

//import { firebase } from '../firebase/firebase-config'
import { AuthRouter } from './AuthRouter';
import { PrivateRoute } from './PrivateRoute';
import { token, login } from '../actions/auth';
import { PublicRoute } from './PublicRoute';
import { PrincipalScreen } from '../components/main/PrincipalScreen';

export const AppRouter = () => {

    const dispatch = useDispatch();

    const [checking, setChecking] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [networkStatus, setNetworkStatus] = useState(window.navigator.onLine)


    useEffect(() => {
        token.subscribe(x => {
            if (x) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
            console.log(x || "ol")
            setChecking(false);
        });
    }, [dispatch, setChecking, setIsLoggedIn])


    if (checking) {
        return (
            <h1>Espere...</h1>
        )
    }


    return (
        <HashRouter>
            <div>
                <Switch>
                    <PublicRoute
                        path="/auth"
                        component={AuthRouter}
                        isAuthenticated={isLoggedIn}
                    />

                    <PrivateRoute
                        exact
                        isAuthenticated={isLoggedIn}
                        path="/:actualPage"
                        component={PrincipalScreen}
                    />

                    <Redirect to="/auth/login" />


                </Switch>
            </div>
        </HashRouter>
    )
}