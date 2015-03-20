var AjaxPoster = {
    post: function(url, data, callback) {
        var jqxhr = $.post(url, data, function(response) {
            if (response.result == "success") {
                callback(response);
            } else {
                // alert of an error
            }
        }).done(function() { })
          .fail(function() { });
    }
}

var AjaxGetter = {
    get: function(url, callback) {
        var jqxhr = $.get(url, function(response) {
            if (response.result == 'success') {
                callback(response.data);
            }
        });
    }
}
var PrefilledMixin = {
    propTypes: {
        options: React.PropTypes.array.isRequired,
    },
    buildOptions: function() {
        options = [];
        for (var i = 0; i < this.props.options.length; i++) {
            var option = this.props.options[i];
            options.push(
                <option key={i} value={option.value}>{option.display}</option>
            );
        }
        return options;
    }
};

var Editable = {
    /**
     * Editable enable an edit mode for forms. At the end of the form will be added
     * a combobox with all known data for the type edited by the form.
     * Selecting an item out of the combobox will load the object in the form,
     * so the user can modify the object.
     * Class using Editable must implement a load(object) function, to get the object
     * inforlation. They also should test for the inEditMode state flag, to know if
     * they must Create or Edit an object. 
     *
     * Note: this mixin requires both AjaxGetter and AjaxPoster.
     *
     * **/
    propTypes: {
        modifiables: React.PropTypes.array,
        url_get: React.PropTypes.string.isRequired,
        url_modify: React.PropTypes.string.isRequired
    },
    getInitialState: function() { return { inEditMode: false } },
    getObjectAndLoad: function(e) {
        e.preventDefault();
        var to_modify = this.refs.to_modify.getValue();
        this.get(this.props.url_get + to_modify, this.load);
    },
    renderEdit: function() {
        return (
                <div className="input-group">
                    <PrefilledSelector ref="to_modify" options={this.props.modifiables}/>
                    <span className="input-group-btn">
                        <button onClick={this.getObjectAndLoad} className="btn btn-default" type="button">
                            Modify
                        </button>
                    </span>
                </div>
            );
    }
}
