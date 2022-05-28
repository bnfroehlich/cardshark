
import { Link, useParams } from 'react-router-dom';

const Login = () => {
    const { status } = useParams();
    return (
        <div className="centered-body">
            {status === 'fail' &&
                <div className="centered-alert alert alert-danger" role="alert">
                    Invalid username or password
                </div>
            }
            <p>Enter your username and password</p>
            <form method="POST" action="/api/auth/login">
                <div className="form-group">
                    <div className="mb-3">
                        <input className="form-control mx-auto w-auto" type="text" id="username" name="username" placeholder="username" required /><br />
                    </div>
                    <div className="mb-3">
                        <input className="form-control mx-auto w-auto" type="password" id="password" name="password" placeholder="password" required /><br />
                    </div>
                    <button type="submit" class="btn btn-success" value="submit">Submit</button>
                </div>
            </form>
            <p>Don't have an account? <Link to='/register'>Register</Link></p>
        </div>
    )
  };
  
  export default Login;