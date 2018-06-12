export function FetchGoogle (type, userData) {
  let BaseURL = '/auth/';

  return new Promise((resolve, reject) =>{
  fetch(BaseURL+type, {
      method: 'POST',
  })
  .then((response) => 
  response.json())
  .then((res) => {
      resolve(res);
  })
  .catch((error) => {
     reject(error);
  });
  
  });
  }