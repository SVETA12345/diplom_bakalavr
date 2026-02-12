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
    
    addAttempt(attempt, testId){
        return fetch(`${this._url}/attempts/${testId}`, {
            method: 'POST',
            withCredentials: true,
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify(attempt)
          }).then((res)=>{
            return this._getResponseData(res)
        })
    } 
    getAttemptById(attemptId){
        return fetch(`${this._url}/attempts/${attemptId}`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,
            headers: this._headers,
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
}

export const attemptsApi = new Api({
    url:'http://localhost:3005/api',
    headers:{
      'Content-Type': 'application/json',
    },

  })