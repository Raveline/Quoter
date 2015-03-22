"use strict"
var React = require('react/addons');
var $ = require('jquery');

var Tab = React.createClass({
    propTypes: {
        isActive: React.PropTypes.bool.isRequired,
        onClick: React.PropTypes.func.isRequired
    },
    render: function() {
        var className = React.addons.classSet({active: this.props.isActive})
        return (
            <li className={className} onClick={this.props.onClick}>
                <a href={this.props.url}>{this.props.name}</a>
            </li>);
    }
});

var QuoterAccess = React.createClass({
    getInitialState: function() { return {activeTab: 0}},
    switchTab: function(idx) { this.setState({activeTab: idx}); },
    paneModels: [
        {tabName: "Choose folder", url:'#quote-folder'},
        {tabName: "Find a quote", url:'#quote-find'},
        {tabName: "Add a quote", url:'#quote-add'},
        {tabName: "Add a source", url:'#source-add'},
        {tabName: "Add an author", url:'#author-add'}],
    render: function() { 
        $('.tab-pane.active').removeClass('active');
        $($('.tab-pane').get(this.state.activeTab)).addClass('active');
        return (
        <TabbedArea
            paneModels={this.paneModels}
            activeTab={this.state.activeTab}
            switchTab={this.switchTab}/>
    );
    }
});

var TabbedArea = React.createClass({
    propTypes: { paneModels: React.PropTypes.array.isRequired,
                  activeTab: React.PropTypes.number.isRequired,
                  switchTab: React.PropTypes.func.isRequired
    },
    handleClick: function(idx, e) {
        e.preventDefault();
        this.props.switchTab(idx);
    },
    render: function() {
        return this.transferPropsTo(
                <ul className="nav nav-tabs nav-pills nav-stacked">
                    {this.renderTabs()}
                </ul>);
    },
    renderTabs: function() {
        return this.props.paneModels.map(function(tabName, idx) {
            return (
                <Tab key={idx} onClick={this.handleClick.bind(this, idx)}
                               isActive={idx === this.props.activeTab}
                               name={tabName.tabName}
                               url={tabName.url}
                />);
        }.bind(this));
    }
});

var QuoterNav = React.createClass({
    render: function() { return (
        <div className="col-md-2" id="main-menu-container">
            <ul id="main-menu" className="nav nav-tabs nav-pills nav-stacked">
                <li className="active"><a href="#quote-folder">Choose folder</a></li>
                <li><a href="#quote-find">Find a quote</a></li>
                <li><a href="#quote-add">Add a quote</a></li>
                <li><a href="#source-add">Add a source</a></li>
                <li><a href="#author-add">Add an author</a></li>
                <li><a href="#">Export quoter</a></li>
                <li><a href="#">Stats</a></li>
            </ul>
        </div>
    );
    }
});

module.exports = QuoterAccess
