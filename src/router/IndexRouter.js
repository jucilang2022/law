import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import Login from '../views/login/Login'
import NewsSandBox from '../views/sandbox/NewsSandBox.js'
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min'
import News from '../views/news/News.js'
import Detail from '../views/news/Detail.js'
export default function IndexRouter() {
    return (
        <HashRouter>
            <Switch>
                <Route path='/login' component={Login} />
                <Route path='/users' component={News} />
                <Route path='/detail/:id' component={Detail} />
                <Route path='/' render={() =>
                    localStorage.getItem('token') ?
                        <NewsSandBox></NewsSandBox> :
                        <Redirect to='/login' />
                } />
                {/* <Route path='/' component={NewsSandBox} /> */}
            </Switch>
        </HashRouter>
    )
}