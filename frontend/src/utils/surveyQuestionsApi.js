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
    getSurveyQuestions(testId){
        return fetch(`${this._url}/surveyQuestions/${testId}`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,
            headers: this._headers,
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    addSurveyQuestion(question){
        return fetch(`${this._url}/surveyQuestions/`, {
            method: 'POST',
            withCredentials: true,
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify(question)
          }).then((res)=>{
            return this._getResponseData(res)
        })
    } 
    updateSurveyQuestion(question){
        return fetch(`${this._url}/surveyQuestions/`, {
            method: 'PATCH',
            withCredentials: true,
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify(question)
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    deleteSurveyQuestion(questionId){
        return fetch(`${this._url}/surveyQuestions/${questionId}`, {
            method:"DELETE",
            withCredentials: true,
            credentials: 'include',
            headers:this._headers
        }).then((res)=>{
            return this._getResponseData(res)
        })
    }
}

export const surveyQuestionsApi = new Api({
    url:'http://localhost:3005/api',
    headers:{
      'Content-Type': 'application/json',
    },

  })