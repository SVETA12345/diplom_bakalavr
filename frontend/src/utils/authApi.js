
//export const BASE_URL = 'https://movies.mao321.keenetic.pro/api';
export const BASE_URL = 'http://localhost:3005/api';
function getResponseData(res) {
    console.log(res)
  if (res.ok) {
      return res.json();
  }
  return Promise.reject({status: res.status});
}

export const register = ( data, setIsDisabled) => {
  setIsDisabled(true)
  return fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })
  .then((response) => {
    setIsDisabled(false)
      return getResponseData(response)
    
  })
}; 

export const authorize = (loginData, setIsDisabled) => {
    setIsDisabled(true)
    return fetch(`${BASE_URL}/signin`, {
      withCredentials: true,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(loginData)
    })
    .then((response) => {
      setIsDisabled(false)
      return getResponseData(response)
    })
    .then((data) => {
      
      if (data.token){
        return data;
      }
    })
  }; 

  // получение данных пользователя
  export const getContent = () => {
    return fetch(`${BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    .then((res) => {
      return getResponseData(res) 
    })
    .then(data => data)
  } 