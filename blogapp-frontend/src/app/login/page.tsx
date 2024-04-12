'use client'
export default function Login() {
    const handleLogin = () => {
        console.log("you clicked button")
    }
    return (<div className="login-wrapper">
        <p>welcome to login page</p>
        <div className="form-wrapper">
            <input type="text" placeholder="username" />
            <input type="text" placeholder="password" />
            <button onClick={handleLogin}>login</button>
        </div>
    </div>)
}