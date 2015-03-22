"use strict"
var React = require("react");
var QuoterMenu = require("./quoter.js");
var QuoterAccess = require("./tabs.js");

var Quoter = React.createClass({
    propTypes: {
        folders: React.PropTypes.array.isRequired,
        tags: React.PropTypes.array.isRequired
    },
    render: function() { return (
        <div>
            <div className="col-md-2" role="navigation" id="main-menu-container">
                <QuoterAccess/>
            </div>
            <div className="col-md-8" id="quoterForms">
                <QuoterMenu folders={this.props.folders} tags={this.props.tags}/>
            </div>
        </div>
        );
    }
});

window.app = (function() {
    var app = {}
    app.buildQuoter = function(folders_array, tags_array) {
        React.render(<Quoter folders={folders_array} tags={tags_array}/>, document.body);
    }
    return app;
});

window.React = React
