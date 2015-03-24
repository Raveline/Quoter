"use strict"
var React = require("react");
var QuoterMenu = require("./quoter.js");
var QuoterAccess = require("./tabs.js");

var Quoter = React.createClass({
    propTypes: {
        folders: React.PropTypes.array.isRequired,
        tags: React.PropTypes.array.isRequired,
        userName: React.PropTypes.string.isRequired,
        currentFolder: React.PropTypes.string.isRequired
    },
    tabHandler: function(idx) {
        this.refs.tabs.switchTab(idx);
    },
    render: function() { return (
        <div>
        <div className="well well-sm">
            Logged as {this.props.userName} - Current folder : {this.props.currentFolder} - <a href="/logout">Logout</a>
        </div>
        <div>
            <div className="col-md-2" role="navigation" id="main-menu-container">
                <QuoterAccess ref="tabs"/>
            </div>
            <div className="col-md-8" id="quoterForms">
                <QuoterMenu folders={this.props.folders} tags={this.props.tags} tabHandler={this.tabHandler}/>
            </div>
        </div>
        </div>
        );
    }
});

window.app = (function() {
    var app = {}
    app.buildQuoter = function(user_name, folder_name, folders_array, tags_array) {
        React.render(<Quoter userName={user_name} currentFolder={folder_name} folders={folders_array} 
                      tags={tags_array}/>, document.getElementById('quoter_container'));
    }
    return app;
});

window.React = React
