
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

  export const updateUserData = (user) => {
    return fetch(`${BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(user)
    })
    .then((res) => {
      return getResponseData(res) 
    })
    .then(data => data)
  } 

  export const logout = () => {
        return fetch(`${BASE_URL}/signout`, {
            method: "POST",
            withCredentials: true,
            credentials: 'include', // <--- YOU NEED THIS LINE
            headers:  {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          }).then((res) => {
              return getResponseData(res) 
          })
    }

export const sendResetCode = (email) => {
  return fetch(`${BASE_URL}/send-reset-code`, {
    method: 'POST',
    withCredentials: true,
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  }).then((res) => {
              return getResponseData(res) 
          })
};

export const verifyCodeAndResetPassword = (email, code, newPassword) => {
  return fetch(`${BASE_URL}/verify-reset-code`, {
    method: 'POST',
    withCredentials: true,
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, code, newPassword })
  }).then((res) => {
              return getResponseData(res) 
          })
};

export const authorizeWithTwoFactor = (loginData, setIsDisabled) => {
  return fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    withCredentials: true,
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(loginData)
  }).then((res) => {
              return getResponseData(res) 
          })
};

export const resendTwoFactorCode = (email) => {
    return fetch(`${BASE_URL}/send-twofactor-code`, {
        method: 'POST',
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email })
    }).then((res) => {
        return getResponseData(res);
    });
};
