import react from 'react'
import style from './Child.module.scss'

export default function Child() {
    return (
        <div>
            <ul>
                <li className={style.item}>child111</li>
                <li className={style.item}>child222</li>
            </ul>
        </div>
    )
}
