import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

import client from '@/api/client';
import { toast } from 'sonner';

const Login = () => {
    const handleSignup = async(e)=>{
        e.preventDefault();
        const email = e.target[0]?.value;
        const password = e.target[1]?.value;
        console.log(email , password);

        if(!email || !password){
            toast.error('please enter email and password');
            return;
        }

        const {data, error} = await client.auth.signInWithPassword({
            email, 
            password,
        });

        if(error){
            toast.error('Unable to sign in.Try later')
        }
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter email & password</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSignup}>
                    <div className='flex flex-col gap-6'>
                        <div className='grid gap-2'>
                            <Label>Emails</Label>
                            <Input id='email' type='email' placeholder='example@example.com' />
                        </div>
                        <div className='grid gap-2'>
                            <Label>Password</Label>
                            <Input id='password' type='password'  />
                        </div>
                        <Button type='submit' className='w-full'>Login</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default Login;

