"use strict"
var React = require('react');
var common = require("./common.js");
var DjangoCSRF = require('./csrf.js');

var SourceForm = React.createClass({
    mixins: [common.AjaxPoster, common.AjaxGetter, common.Editable],
    propTypes: {
        addSource: React.PropTypes.func.isRequired,
        authors: React.PropTypes.array.isRequired,
        sources: React.PropTypes.array.isRequired
    },
    load: function(data) {
        this.refs.title.getDOMNode().value = data.title;
        this.refs.authors.setValues(data.authors);
        this.refs.metadata.setValues(data.metadata);
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var title = this.refs.title.getDOMNode().value.trim();
        var authors = this.refs.authors.getValue();
        var metadata = this.refs.metadata.getValues();
        if (!title) {
            return;
        }
        this.refs.title.getDOMNode().value = '';
        this.refs.authors.empty();
        this.refs.metadata.empty();
        // Build source
        var newSource = { 'title' : title,
                          'authors' : authors.toString(),
                          'metadata' : JSON.stringify(metadata)}
        // Call adder...
        this.post('source/new', newSource, function(info) {
                this.props.addSource(info.newObject);
            }.bind(this));
    },
    render: function() { return (
        <div id="source-add" className="tab-pane fade in">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Add a source</h3>
                </div>
                <div className="panel-body">
                    <form role="form" onSubmit={this.handleSubmit}>
                        <DjangoCSRF/>
                        <InfiniteAuthorSelector ref="authors" authors={this.props.authors}/>
                        <div className="form-group">
                            <label htmlFor="title">Title</label>
                            <input type="text" name="title" ref="title" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label>Metadata</label>
                            <InfiniteMetadata ref="metadata"/>
                        </div>
                        <button type="submit" className="btn btn-default">Save</button>
                    </form>
                </div>
            </div>
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">... or pick a source to modify</h3>
                </div>
                <div className="panel-body">
                    {this.renderEdit()}
                </div>
            </div>
        </div>
    );
    }
});

var InfiniteAuthorSelector = React.createClass({
    propTypes: {
        authors: React.PropTypes.array.isRequired
    },
    setValues: function(authors) {
        // Asynchronously update the field that we'll create
        this.setState({numAuthors: authors.length}, function() {
            for (var i = 0; i < authors.length; i++) {
                this.refs[i].setValue(authors[i]);
            }
        });
    },
    getInitialState: function() { 
        return { numAuthors: 1 }
    },
    empty: function() {
        this.setState(this.getInitialState());
        this.refs[0].empty();
    },
    addAuthor: function(e) {
        if (e) {
            e.preventDefault();
        }
        this.setState({numAuthors: this.state.numAuthors + 1});
    },
    reinitalize: function() {
        this.setState(getInitialState());
    },
    removeAuthor: function(e) {
        if (e) {
            e.preventDefault();
        }
        this.setState({numAuthors: this.state.numAuthors - 1});
    },
    buildAuthors: function() {
        var toReturn = [];
        for (var i = 0; i < this.state.numAuthors; i++) {
            toReturn.push(this.buildAuthor(i));
        }
        return toReturn;
    },
    buildAuthor: function(id) {
        return (
            <div className="input-group">
                <common.PrefilledSelector ref={id} options={this.props.authors}/>
                <span className="input-group-btn">
                    <button className="btn btn-default" id="button-new-author" type="button">Add new</button>
                </span>
            </div>
        )
    },
    getValue: function() {
        results = [];
        for (var i = 0; i < this.state.numAuthors; i++) {
            if (this.refs[i]) {
                results.push(this.refs[i].getValue());
            }
        }
        return results;
    },
    render: function() { 
        var authors = this.buildAuthors();
        var linkRemove = "";
        if (this.state.numAuthors > 1) {
            linkRemove = (<div className="form-group">
                            <a href="#" onClick={this.removeAuthor}>Remove an author from this source</a>
                          </div>)
        }
        return (
            <div id="authors_for_source">
                <div className="form-group author-group">
                    <label htmlFor="source_author">Author(s)</label>
                    {authors}
                </div>
                <div className="form-group">
                    <a onClick={this.addAuthor} href="#">Add another author to this source.</a>
                </div>
                {linkRemove}
            </div>
        );
    }
});

var InfiniteMetadata = React.createClass({
    getInitialState: function() {
        return { metadataNumber: 1 }
    },
    setValues: function(metadata) {
        this.setState({metadataNumber: metadata.length+1}, function() {
            for (var i = 0; i < this.state.metadataNumber; i++) {
                if (i < metadata.length) {
                    this.refs[i].setValue(metadata[i]);
                } else {
                    this.refs[i].empty();
                }
            }
        });
    },
    empty: function() {
        this.refs[0].empty();
        this.setState({metadataNumber:1});
    },
    onChildBlur: function(child_key) {
        if (child_key === this.state.metadataNumber) {
            this.setState({metadataNumber : this.state.metadataNumber + 1});
        }
    },
    getValues: function() {
        values = {};
        for (var i = 0; i < this.state.metadataNumber; i++) {
            meta = this.refs[i].getValue();
            if (meta) {
                values[meta[0]] = meta[1];
            }
        }
        return values;
    },
    render: function() {
        var metadata = [];
        for (var i = 0; i < this.state.metadataNumber; i++) {
            metadata.push(
                <SingleMetadata ref={i} childNumber={i+1} blurCallback={this.onChildBlur}/>
            );
        }
        return (<div>{metadata}</div>);
    }
});

var SingleMetadata = React.createClass({
    propTypes: {
        blurCallback: React.PropTypes.func.isRequired,
        childNumber: React.PropTypes.number.isRequired
    },
    onBlur: function() {
        if (this.refs.metadata2.getDOMNode().value) {
            this.props.blurCallback(this.props.childNumber);
        }
    },
    empty: function() {
        this.refs.metadata1.getDOMNode().value = '';
        this.refs.metadata2.getDOMNode().value = '';
    },
    getValue: function() {
        meta1 = this.refs.metadata1.getDOMNode().value;
        meta2 = this.refs.metadata2.getDOMNode().value;
        if (meta1 && meta2) {
            return [meta1, meta2];
        }
        return [];
    },
    setValue: function(metadata) {
        for (var key in metadata) {
            this.refs.metadata1.getDOMNode().value = key;
            this.refs.metadata2.getDOMNode().value = metadata[key];
        }
    },
    render: function() {
        return (
            <div id="metadata-container">
                <div className="row">
                    <div className="col-xs-4">
                        <input ref="metadata1" name="metadata1" type="text" className="form-control" placeholder="Information"/>
                    </div>
                    <div className="col-xs-4">
                        <input ref="metadata2" name="metadata2" type="text" className="form-control" onBlur={this.onBlur} placeholder="Value"/>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = SourceForm
