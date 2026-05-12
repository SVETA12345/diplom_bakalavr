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
    
    getSurveys(){
        return fetch(`${this._url}/surveys`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,
            headers: this._headers,
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    getSurveyById(surveyId){
        return fetch(`${this._url}/surveys/${surveyId}`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,
            headers: this._headers,
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    getSurveyLink(surveyId){
        return fetch(`${this._url}/qr/test-link/${surveyId}`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,
            headers: this._headers,
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    getSurveyQr(surveyId){
        return fetch(`${this._url}/qr/generate-qr/${surveyId}`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,
            headers: this._headers,
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    addSurvey(test){
        return fetch(`${this._url}/surveys/`, {
            method: 'POST',
            withCredentials: true,
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify(test)
          }).then((res)=>{
            return this._getResponseData(res)
        })
    } 
    updateSurvey(survey){
        return fetch(`${this._url}/surveys/`, {
            method: 'PATCH',
            withCredentials: true,
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify(survey)
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    deleteSurvey(surveyId){
        return fetch(`${this._url}/surveys/${surveyId}`, {
            method:"DELETE",
            withCredentials: true,
            credentials: 'include',
            headers:this._headers
        }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    
}

export const surveysApi = new Api({
    url:'http://localhost:3005/api',
    headers:{
      'Content-Type': 'application/json',
    },

  })