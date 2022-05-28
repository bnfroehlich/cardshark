const Home = (props) => {
    return (
        <div className="centered-body">
            <p className="title">
                Welcome to CardShark{props.user && <span>, {props.user.username}</span>}
            </p>
            <img src={require("../shark.png")} alt="shark" width="450" height="400" />
        </div>
    )
  };
  
  export default Home;
  
  /*
    */