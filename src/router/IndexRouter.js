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
import Appointment from '../views/notary/Appointment.js'
import MyAppointments from '../views/appointment/MyAppointments'
import AppointmentManage from '../views/appointment/AppointmentManage'
import CaseProgress from '../views/case/CaseProgress'

// 权限控制组件
const PrivateRoute = ({ component: Component, roles, ...rest }) => {
    const token = localStorage.getItem('token');
    const userInfo = token ? JSON.parse(token) : null;

    return (
        <Route
            {...rest}
            render={props => {
                if (!token) {
                    return <Redirect to="/login" />;
                }

                // 检查用户角色
                if (userInfo && userInfo.roleId === 3) { // 3 是普通用户角色
                    return <Component {...props} />;
                }

                return <Redirect to="/" />;
            }}
        />
    );
};

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
                <Route path='/notary/appointment' component={Appointment} />
                <Route path='/appointment/my' component={MyAppointments} />
                <Route path='/appointment-manage' component={AppointmentManage} />
                <Route path='/case-progress' component={CaseProgress} />
                <Route path='/' render={() =>
                    localStorage.getItem('token') ?
                        <NewsSandBox></NewsSandBox> :
                        <Redirect to='/login' />
                } />
            </Switch>
        </HashRouter>
    )
}