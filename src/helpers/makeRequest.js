import axios from "axios";
import { conf } from "../config/config.js";
const baseURL = conf.apiURL;

export const makeGET = (endpoint = '', query = '') => {
    return axios.get(baseURL + endpoint + query)
}

export const makePOST = (endpoint = '', body = '') => {
    return axios.post(baseURL + endpoint, body)
}

export const makePATCH = (endpoint = '', body = '') => {
    return axios.patch(baseURL + endpoint, body)
}

export const makeDELETE = (endpoint = '', body = '') => {
    console.log({ data: body })
    return axios.delete(baseURL + endpoint, { data: body })
}

