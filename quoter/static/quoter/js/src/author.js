var React = require('react');

var AuthorForm = React.createClass({
    mixins: [AjaxPoster, AjaxGetter, Editable],
    propTypes: {
        addAuthor: React.PropTypes.func.isRequired,
        authors: React.PropTypes.array.isRequired
    },
    load: function(data) {
        this.refs.author_first_name.getDOMNode().value = data.first_name;
        this.refs.author_last_name.getDOMNode().value = data.last_name;
        this.refs.author_surname.getDOMNode().value = data.surname;
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var first_name = this.refs.author_first_name.getDOMNode().value.trim();
        var last_name = this.refs.author_last_name.getDOMNode().value.trim();
        var surname = this.refs.author_surname.getDOMNode().value.trim();
        if (!first_name && !last_name && !surname) {
            return;
        }
        this.refs.author_first_name.getDOMNode().value = '';
        this.refs.author_last_name.getDOMNode().value = '';
        this.refs.author_surname.getDOMNode().value = '';
        // Build author...
        var newAuthor = { 'first_name' : first_name,
                          'last_name' : last_name,
                          'surname' : surname }
        // Call adder...
        this.post('author/new', newAuthor, function(info) {
                this.props.addAuthor(info.newObject);
            }.bind(this));
    },
    render: function() { 
        var editForm = this.renderEdit()
        return (
        <div id="author-add" className="tab-pane fade in">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Add an author</h3>
                </div>
                <div className="panel-body">
                    <form role="form" onSubmit={this.handleSubmit}>
                        <DjangoCSRF/>
                        <div className="form-group">
                            <label htmlFor="author_first_name">First name</label>
                            <input type="text" ref="author_first_name" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="author_last_name">Last name</label>
                            <input type="text" ref="author_last_name" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="author_surname">Surname</label>
                            <input type="text" ref="author_surname" className="form-control"/>
                        </div>
                        <button type="submit" className="btn btn-default">Save</button>
                    </form>
                </div>
            </div>
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">... or pick an author to modify</h3>
                </div>
                <div className="panel-body">
                    {editForm}
                </div>
            </div>
        </div>
    );
    }
});
