import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';
import { types } from '../types/types';
import { startLoading, finishLoading } from './ui';
import { makePOST } from '../helpers/makeRequest';
const tokenSubject = new BehaviorSubject((localStorage.getItem('token')));

export const token = tokenSubject.asObservable()

export const startLoginEmailPassword = (email, password) => {
    return (dispatch) => {

        dispatch(startLoading());

        return makePOST("api/login", { email, password })
            .then(({ data }) => {
                console.log(data)
                dispatch(login(data.token, data.nombre, email));
                localStorage.setItem('email', email)
                localStorage.setItem('token', data.token)
                tokenSubject.next(data.token)
                dispatch(finishLoading());
            })
            .catch(e => {
                console.log(e)
                dispatch(finishLoading());
                Swal.fire('Error', 'Por favor ingrese una contraseña o usuario válidos', 'error');
            })

    }
}

export const login = (uid, displayName, token) => ({
    type: types.login,
    payload: {
        uid,
        displayName,
        token
    }
});

export const startLogout = () => {
    return async (dispatch) => {
        localStorage.removeItem('email')
        localStorage.removeItem('token')
        tokenSubject.next(null)
        dispatch(logout());
    }
}


export const logout = () => ({
    type: types.logout
})


