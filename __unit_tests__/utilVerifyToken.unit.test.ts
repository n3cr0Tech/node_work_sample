import { AuthorizeValidToken } from "../src/utils/verifyToken";
import { ThrowErrorMessage } from "../src/utils/errorHandler";
import httpMocks from 'node-mocks-http';
import dotenv from 'dotenv';


dotenv.config();

test('VerifyToken returns properly when no token is attached to the request header', async() => {
   let request = httpMocks.createRequest({
    method: 'POST',
    url: '/auth/test'
   });

   let response = httpMocks.createResponse();
   let result = AuthorizeValidToken(request, response, (err:any) => {
    expect(err).toThrowError(Error);
   });   

   expect(result._getData()).toBe('Access Denied: No access token found');
   expect(result.statusCode).toBe(401);
});

test('VerifyToken returns properly when INVALID token is attached to the request header', async() => {
   let PORT_NUM = process.env.PORT_NUM ?? ThrowErrorMessage('ERROR! PORT_NUM is null in the .env file');
   let AUTH_TOKEN_HEADER_NAME = process.env.AUTH_TOKEN_HEADER_NAME ?? ThrowErrorMessage("ERROR: Null value for env variable AUTH_TOKEN_HEADER_NAME");   
   let originURL = 'http://localhost:' + PORT_NUM;
   let reqHeader = {} as any;
   reqHeader['origin'] = originURL;
   reqHeader['referer'] = originURL;
   reqHeader[AUTH_TOKEN_HEADER_NAME] = 'blah-invalid-token';
   let request = httpMocks.createRequest({
      method: 'POST',
      url: '/auth/test',
      headers: reqHeader      
   });

   let response = httpMocks.createResponse();
   let result = AuthorizeValidToken(request, response, (err:any) => {  });   
      
   expect(result.statusCode).toBe(400);
   expect(result._getData()).toBe('Invalid Token');
});

test('VerifyToken returns properly when VALID token is attached to the request header', async() => {
   let PORT_NUM = process.env.PORT_NUM ?? ThrowErrorMessage('ERROR! PORT_NUM is null in the .env file');
   let AUTH_TOKEN_HEADER_NAME = process.env.AUTH_TOKEN_HEADER_NAME ?? ThrowErrorMessage("ERROR: Null value for env variable AUTH_TOKEN_HEADER_NAME");
   let TEST_AUTH_TOKEN = process.env.TEST_AUTH_TOKEN ?? ThrowErrorMessage("ERROR: Null value for env variable TEST_AUTH_TOKEN");
   let originURL = 'http://localhost:' + PORT_NUM;
   let reqHeader = {} as any;
   reqHeader['origin'] = originURL;
   reqHeader['referer'] = originURL;
   reqHeader[AUTH_TOKEN_HEADER_NAME] = TEST_AUTH_TOKEN
   let request = httpMocks.createRequest({
      method: 'POST',
      url: '/auth/test',
      headers: reqHeader      
   });

   let nextFunctionIsCalled = false;
   let response = httpMocks.createResponse();
   let result = AuthorizeValidToken(request, response, (err:any) => {
      nextFunctionIsCalled = true;
   });   
      
   expect(nextFunctionIsCalled).toBe(true);   
});