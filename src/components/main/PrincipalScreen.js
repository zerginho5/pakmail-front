import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router';
import { InicioScreen } from './InicioScreen';
import { startLogout } from '../../actions/auth';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar, Container, Nav } from 'react-bootstrap';
export const PrincipalScreen = () => {
    const { actualPage } = useParams()
    const dispatch = useDispatch();
    const handleLogout = () => {
        dispatch(startLogout())
    }
    const user = useSelector(state => state.auth);
    const [page, setPage] = useState(actualPage == ':actualPage' ? 'inicio' : actualPage)
    useEffect(() => {
        console.log(user)
    }, [])
    return (
        <>
            <Navbar expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Navbar.Text>
                            {user?.name}
                        </Navbar.Text>
                    </Navbar.Collapse>
                    <Navbar.Collapse className="justify-content-end">
                        <Nav>
                            <Nav.Link onClick={handleLogout}>
                                <span className="text-light">Salir </span>
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            {
                (page == 'inicio') &&
                <InicioScreen />
            }
        </>
    )
}
