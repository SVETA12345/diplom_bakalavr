class Api{
    constructor(config){
        this._url=config.url;
        this._headers=config.headers
    }
    _getResponseData(res) {
        if (res.ok) {
            return res.json();
        }
        return  res.json()
        .then(data => {
            // Пробрасываем ошибку с сообщением из сервера
            return Promise.reject({
                status: res.status,
                message: data.message || res.statusText
            });
        })
        
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
    getTestById(testId){
        return fetch(`${this._url}/tests/${testId}`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,
            headers: this._headers,
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    getTestLink(testId){
        return fetch(`${this._url}/qr/test-link/${testId}`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,
            headers: this._headers,
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    getTestQr(testId){
        return fetch(`${this._url}/qr/generate-qr/${testId}`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,
            headers: this._headers,
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    addTest(test){
        return fetch(`${this._url}/tests/`, {
            method: 'POST',
            withCredentials: true,
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify(test)
          }).then((res)=>{
            return this._getResponseData(res)
        })
    } 
    updateTest(test){
        return fetch(`${this._url}/tests/`, {
            method: 'PATCH',
            withCredentials: true,
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify(test)
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    deleteTest(testId){
        return fetch(`${this._url}/tests/${testId}`, {
            method:"DELETE",
            withCredentials: true,
            credentials: 'include',
            headers:this._headers
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