import React, { Component } from 'react';

class Console extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputText: ''
        }
        this.logRef = React.createRef();
    }
    
    inputChanged(e) {
        this.setState({inputText: e.target.value});
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.chat(this.state.inputText);
        this.setState({inputText: ''});
    }
    
    componentDidMount() {
        this.logRef.current.scrollTop = this.logRef.current.scrollHeight;
    }
    
    componentDidUpdate() {
        this.logRef.current.scrollTop = this.logRef.current.scrollHeight;
    }

    render() {
        const rows = window.innerWidth < 500 ? 6 : 15;
        return (
            <div>
                <form onSubmit={(e) => this.handleSubmit(e)}>
                    <div className="form-group overflow-auto d-flex">
                        <textarea className="log form-control mx-auto w-auto" id="log" name="log" disabled
                            rows={rows} ref={this.logRef} value={this.props.log} />
                    </div>
                    <div className="form-group overflow-auto">
                        <input type="text" className="form-control mx-auto w-auto" id="chat" name="chat"
                            onInput={(e) => this.inputChanged(e)} value={this.state.inputText} />
                    </div>
                </form>
            </div>
        )
    }
}

export default Console;