var AddFolderForm = React.createClass({
    mixins: [AjaxPoster],
    render: function() { return (
        <form method="POST" action="/folder/add" role="form" onSubmit={this.handleSubmit}>
            <DjangoCSRF/>
            <div className="form-group">
                <label htmlFor="folder-name">New folder name</label>
                <div className="input-group">
                    <input ref="new_folder_name" type="text" name="new-folder-name" className="form-control"/>
                    <span className="input-group-btn">
                        <button id="createNewFolder" className="btn btn-default" type="submit">Create</button>
                    </span>
                </div>
            </div>
        </form>
        );
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var new_folder_name = this.refs.new_folder_name.getDOMNode().value.trim();
        if (!new_folder_name) {
            return;
        }
        this.refs.new_folder_name.getDOMNode().value = '';
        this.post("/folder/add", {'new-folder-name' : new_folder_name }, function() { });
    }
});

var FolderForm = React.createClass({
    mixins: [AjaxPoster],
    propTypes: {
        folders: React.PropTypes.array.isRequired
    },
    pickFolder: function(e) {
        e.preventDefault();
        this.post('/folder/pick', 
                  {'existing-folder': this.refs.folderpick.getValue()},
                  this.reload());
    },
    reload: function() {
        location.reload();
    },
    render: function() { return (
        <div id="quote-folder" className="tab-pane fade in active">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Pick a folder</h3>
                </div>
                <div className="panel-body">
                    <AddFolderForm/>
                    <form onSubmit={this.pickFolder} role="form">
                        <DjangoCSRF/>
                        <div className="form-group">
                            <label htmlFor="folder-pick">Pick an existing folder</label>
                            <div className="input-group">
                                <PrefilledSelector ref="folderpick" options={this.props.folders}/>
                                <span className="input-group-btn">
                                    <button id="pickExistingFolder" className="btn btn-default" type="submit">Pick</button>
                                </span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
    }
});
