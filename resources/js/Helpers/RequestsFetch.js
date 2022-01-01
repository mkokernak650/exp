import axios from "axios";

export default async function RequestsFetch(method, uri, params) {
    const response = await axios.post(route(uri), params)
        .then(res => res)

    return response;

    // const bodyOptions = {
    //     method: method,
    //     headers: {
    //         'Accept': 'application/json',
    //         'Content-Type': 'application/json',
    //         "_token": "{{ csrf_token() }}",
    //     },
    //     body: JSON.stringify(params)
    // }
    // console.log({ bodyOptions })
    // const response = await fetch(route(url), bodyOptions)
    //     .then(res => res)
    // console.log(response)
    // return response;
}
