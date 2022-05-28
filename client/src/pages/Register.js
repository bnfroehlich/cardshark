import { useParams } from 'react-router-dom';

const Register = () => {
    const { status } = useParams();
    return (
        <div className="centered-body">
            {status === 'fail' &&
                <div className="centered-alert alert alert-danger" role="alert">
                    Failed to register user
                </div>
            }
            <p>Choose your email, username and password</p>
            <form method="POST" action="/api/auth/register">
                <div className="form-group">
                    <div className="mb-3">
                        <input className="form-control mx-auto w-auto" type="email" id="email" name="email" placeholder="email" required /><br />
                    </div>
                    <div className="mb-3">
                        <input className="form-control mx-auto w-auto" type="text" id="username" name="username" placeholder="username" required /><br />
                    </div>
                    <div className="mb-3">
                        <input className="form-control mx-auto w-auto" type="password" id="password" name="password" placeholder="password" required /><br />
                    </div>
                    <div className="mb-3">
                        <input className="form-control mx-auto w-auto" type="password" id="confirmPassword" name="confirmPassword" placeholder="confirm password" required /><br />
                    </div>
                    <div className="mb-3">
                        <button type="submit" class="btn btn-success" value="submit">Submit</button>
                    </div>
                </div>
            </form>
        </div>
    )
  };
  
  export default Register;