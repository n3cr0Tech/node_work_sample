import router from '../src/routes/auth';
import bcrypt from "bcryptjs";
import app from '../src/index';
import httpMocks from 'node-mocks-http';
import dotenv from 'dotenv';
import request from "supertest";
import {ValidationInstance} from '../src/utils/validation';
import { mock } from 'node:test';
import mongoose, { ConnectOptions } from 'mongoose';
import { User } from '../src/models/User';
import { MongoClient } from 'mongodb';
import { ThrowErrorMessage } from '../src/utils/errorHandler';
import ShortUniqueId from "short-unique-id";
import jwt  from 'jsonwebtoken';

dotenv.config();

describe('auth has existing route paths and proper corresponding methods', () => {
    const routes = [
        { path: "/register", method: 'post'},
        { path: "/login", method: 'post'}
    ]

    routes.forEach((route) => {
        const match = router.stack.find(
            (s:any) => s.route.path === route.path && s.route.methods[route.method]
        );
        expect(match).toBeTruthy();
    });
});

describe('POST /register happy path', function(){     
    let mockBody = {
        username: "Batman-foo-integ-test"
    };   
    
    it('responds with 200 with new User details', async() => {
        let foo = {} as any;
        jest.spyOn(ValidationInstance, 'RegisterValidation').mockImplementation(() => foo);           

        try{
            const response = await request(app)
            .post('/api/user/register')
            .set('Accept', 'application/json')
            .send(mockBody)
            .expect(200);        

            expect(response).toBeTruthy();

            expect(response.body.uid.toString().length).toBeGreaterThan(0);
            expect(response.body.username).toBe(mockBody.username);
            expect(response.body.password).toBeTruthy();
            expect(response.body.trophies.length).toBe(0); 
        }catch(error){            
            ThrowErrorMessage(`Something went wrong with register happy path test: ${error}`);
        }           
    });

    afterEach(async() => {        
        let mongoUrl = process.env.MONGODB_URL ?? ThrowErrorMessage("ERROR: Null value for env variable MONGODB_URL");
        let mongoDBName = process.env.DB_NAME ?? ThrowErrorMessage("ERROR: Null value for env variable DB_NAME");
        //Delete the newly created mock record
        const mongoClient = new MongoClient(mongoUrl);
        try {
            await mongoClient.connect();
            const database = mongoClient.db(mongoDBName);

            await database.collection('users').deleteOne({username: mockBody.username})
          } catch (error) {
            console.error('An error occurred:', error);
          } finally {
            await mongoClient.close();
          }
        // console.log("!!! tear down complete");
  });
});

describe('POST /register sad path', function(){        
    it('endpoint responds with 400', async() => {
        let foo = {} as any;
        jest.spyOn(ValidationInstance, 'RegisterValidation').mockImplementation(() => foo);
    
        const response = await request(app)
        .post('/api/user/register')
        .set('Accept', 'application/json')
        .expect(400);        

        expect(response).toBeTruthy();    
        expect(ValidationInstance.RegisterValidation).toBeCalledTimes(1);    
    })
});


describe('POST /login', function(){     
    let mockBody = {
        username: "Batman-foo-integ-test",
        password: "foo-some-random-password"
    };   
    let mongoUrl = process.env.MONGODB_URL ?? ThrowErrorMessage("ERROR: Null value for env variable MONGODB_URL");
    let mongoDBName = process.env.DB_NAME ?? ThrowErrorMessage("ERROR: Null value for env variable DB_NAME");
    //Delete the newly created mock record inside afterEach
    const mongoClient = new MongoClient(mongoUrl);    

    beforeEach(async() => {
        //Before the test, create a mock User with a password
        //HASH the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(mockBody.password, salt);
        var myUID = new ShortUniqueId({length: 9});
        myUID.setDictionary('number');
            const user = new User({
            uid: myUID(),
            username: mockBody.username,        
            password: hashPassword
        });
        
        try{
            const savedUser = await user.save();            
        }catch(err){
            ThrowErrorMessage(`UH OH Spaghettioes - something went wrong with saving the user: ${err}`);        
        }
    });
    
    it('responds with 200 with jwt token', async() => {
        let foo = {} as any;
        jest.spyOn(ValidationInstance, 'LoginValidation').mockImplementation(() => foo);

        try{
            const response = await request(app)
            .post('/api/user/login')
            .set('Accept', 'application/json')
            .send(mockBody)
            .expect(200);        
            
            expect(ValidationInstance.LoginValidation).toBeCalled();
            expect(response).toBeTruthy();
            expect(response.body.jwt_token).toBeTruthy();
        }catch(error: any){            
            ThrowErrorMessage(`Something went wrong with login happy path test: ${error}`);
        }           
    });

    afterEach(async() => {          
        //After the test, delete the mock User
        try {            
            const database = mongoClient.db(mongoDBName);
            await database.collection('users').deleteOne({username: mockBody.username})
          } catch (error) {
            console.error('An error occurred:', error);
          } finally {
            await mongoClient.close();
          }
        // console.log("!!! tear down complete");
  });
});

 