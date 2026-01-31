class Api{
    constructor(config){
        this._url=config.url;
        this._headers=config.headers
    }
    _getResponseData(res) {
        if (res.ok) {
            return res.json();
        }
        return Promise.reject({status: res.status});
    }
    
    getTests(){
        return fetch(`${this._url}/tests`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,
            headers: this._headers,
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
     
    exitPage(){
        return fetch(`${this._url}/signout`, {
            method: "POST",
            withCredentials: true,
            credentials: 'include', // <--- YOU NEED THIS LINE
            headers: this._headers,
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
}

export const testsApi = new Api({
    url:'http://localhost:3005/api',
    headers:{
      'Content-Type': 'application/json',
    },

  })