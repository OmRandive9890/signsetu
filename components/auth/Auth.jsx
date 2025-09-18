import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Login from './Login';
import Signup from './Signup';

const Auth = () => {
    return (
        <Tabs defaultValue='login' className="w-[400px] mt-[400px]">
            <TabsList className="w-full grid grid-cols-2 ">
                <TabsTrigger value='login'>Login</TabsTrigger>
                <TabsTrigger value='signup'>Signup</TabsTrigger>
            </TabsList>
            <TabsContent value='login'>
                <Login />
            </TabsContent>
            <TabsContent value='signup'>
                <Signup />
            </TabsContent>
        </Tabs>
    )
}

export default Auth;