import React, { Component } from 'react';

class NameInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            name: 'anon'
        };
    }

    onChangeName(e) {
        this.setState({name: e.target.value});
        this.props.setName(e.target.value);
    }

    render() {
        return (
            <div className="container">
                <form>
                    <div className="row">
                        <div className="col-md-6">
                            <p>My Name:</p>
                        </div>
                        <div className="col-md-6">
                            <input type="text" className="form-control" name="name" id="name" aria-describedby="name"
                                value={this.state.name} disabled={this.props.disabled} onChange={(e) => this.onChangeName(e)} />
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export default NameInput;