import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import Login from '../views/login/Login'
import NewsSandBox from '../views/sandbox/NewsSandBox.js'
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min'
import News from '../views/news/News.js'
import Detail from '../views/news/Detail.js'
import KnowledgeDetail from '../views/knowledge/KnowledgeDetail.js'
import LegalMap from '../views/map/LegalMap.js'
import LitigationCalculator from '../views/calculator/LitigationCalculator.js'
import DocumentGenerator from '../views/document/DocumentGenerator.js'

export default function IndexRouter() {
    return (
        <HashRouter>
            <Switch>
                <Route path='/login' component={Login} />
                <Route path='/users' component={News} />
                <Route path='/detail/:id' component={Detail} />
                <Route path='/knowledge/:id' component={KnowledgeDetail} />
                <Route path='/legal-map' component={LegalMap} />
                <Route path='/calculator' component={LitigationCalculator} />
                <Route path='/document-generator' component={DocumentGenerator} />
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