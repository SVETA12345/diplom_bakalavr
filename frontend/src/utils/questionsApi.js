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
    getQuestions(testId){
        return fetch(`${this._url}/questions/${testId}`, {
            method: 'GET',
            credentials: 'include',
            withCredentials: true,
            headers: this._headers,
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    addQuestion(question){
        return fetch(`${this._url}/questions/`, {
            method: 'POST',
            withCredentials: true,
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify(question)
          }).then((res)=>{
            return this._getResponseData(res)
        })
    } 
    updateQuestion(question){
        return fetch(`${this._url}/questions/`, {
            method: 'PATCH',
            withCredentials: true,
            credentials: 'include',
            headers: this._headers,
            body: JSON.stringify(question)
          }).then((res)=>{
            return this._getResponseData(res)
        })
    }
    deleteQuestion(questionId){
        return fetch(`${this._url}/questions/${questionId}`, {
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

export const questionsApi = new Api({
    url:'http://localhost:3005/api',
    headers:{
      'Content-Type': 'application/json',
    },

  })