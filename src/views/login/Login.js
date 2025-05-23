import React from 'react'
import { Form, Button, Input, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import ParticlesBg from 'particles-bg';
import axios from 'axios';
import './Login.css';
export default function Login(props) {
  const [isLogin, setIsLogin] = React.useState(true);

  const onFinish = (values) => {
    if (isLogin) {
      axios.get(`http://localhost:5000/users/?username=${values.username}&password=${values.password}&roleState=true&_expand=role`).then(res => {
        if (res.data.length === 0) {
          message.error('用户名或密码错误！');
        } else {
          localStorage.setItem('token', JSON.stringify(res.data[0]))
          if (res.data[0].roleId === 3) {
            props.history.push('/users')
          } else {
            props.history.push('/home')
          }
        }
      })
    } else {
      axios.get(`http://localhost:5000/users?username=${values.username}`).then(res => {
        if (res.data.length > 0) {
          message.error('用户名已存在！');
        } else {
          axios.post('http://localhost:5000/users', {
            username: values.username,
            password: values.password,
            roleState: true,
            default: true,
            roleId: 3
          }).then(res => {
            message.success('注册成功！');
            setIsLogin(true);
          })
        }
      })
    }
  }

  return (
    <div>
      <ParticlesBg type="circle" bg={true} />
      <div className='formContainer'>
        <div className='logintitle'>智能化在线法律援助平台</div>
        <Form
          name="normal_login"
          className="login-form"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: 'Please input your Username!',
              },
            ]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your Password!',
              },
            ]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              {isLogin ? '登录' : '注册'}
            </Button>
            <Button
              type="link"
              onClick={() => setIsLogin(!isLogin)}
              style={{ marginTop: '10px' }}
            >
              {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
