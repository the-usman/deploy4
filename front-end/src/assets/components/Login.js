import { FormControl, FormLabel, Input, VStack, Button } from '@chakra-ui/react'
import React, { useContext, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Context from '../../ChatContex/ChatContex'
function Login() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const {setChats} = useContext(Context)
    const toast = useToast();

    const [loading, setLoading] = useState(false)

    const onChangeHandle = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }
    const submitHandler = async () => {
        if (!formData.password || !formData.email) {
            toast({
                title: 'Fill all Fields',
                description: "Some data is missing",
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }
    
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json"
                }
            };
            const { data } = await axios.post('/api/user/login', formData, config);
    
            if (data.success) {
                toast({
                    title: 'Login Successful',
                    description: "You have successfully logged in.",
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
    
                localStorage.setItem("userInfo", JSON.stringify(data));
                navigate('/chat');
                setChats("");
                window.location.reload();
            } else {
                toast({
                    title: 'Error Logging In',
                    description: data.error,
                    status: 'warning',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Error during login:", error);
    
            toast({
                title: 'Error',
                description: 'There was an issue with the login. Please try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };
    return (
        <VStack>
            <FormControl id='email' isRequired fontWeight={900}
            m={'5px 0px 5px 0px'}
            >
                <FormLabel fontWeight={900}>
                    Enter your Email
                </FormLabel>
                <Input
                type='email'
                    placeholder="Enter your Email"
                    onChange={onChangeHandle}
                    value={formData.email}
                    name='email'
                />
            </FormControl>
            <FormControl isRequired 
            m={'5px 0px 5px 0px'}>
                <FormLabel fontWeight={900}>
                    Enter your Password
                </FormLabel>
                <Input
                type='password'
                    placeholder="Enter your Password"
                    onChange={onChangeHandle}
                    value={formData.password}
                    name='password'
                />
            </FormControl>
            <Button
            width={"100%"}
            colorScheme='blue'
            style={{marginTop: 15}}
            onClick={submitHandler}
            isLoading = {loading}
            >
                Login
            </Button>
            <Button
            width={"100%"}
            colorScheme='red'
            style={{marginTop: 2}}
            onClick={() => {setFormData({
                email : "guest@demo.chatwave",
                password : "demo001"
                
            })
            submitHandler();
        }
        }
            >
                Get the Guest Credentials
            </Button>
        </VStack>
    )
}

export default Login
