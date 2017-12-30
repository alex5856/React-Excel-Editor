import React, {Component, PropTypes} from 'react'

/*
  Simple HTML5 file input wrapper
  usage: <DataInput handleFile={callback} />
    handleFile(file:File):void;
*/

/* list of supported file types */
const EDITFT = ["xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"].map(function(x) {
   return "." + x
}).join(",")

class DataInput extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const files = e.target.files
    if(files && files[0]) this.props.handleFile(files[0])
  }

  handleClick(e) {
    e.preventDefault()
    // console.log('handClick')
    let f = document.getElementById('file')
    // console.log(f)
    f.click()
  }

  render() {

    let divStyle = {
      float: 'left',
      padding: '0 3px 0 0'
    }

    return (
        <div style={divStyle}>
          {/**<label htmlFor="file">檔案上傳</label>**/}
          <input type="file"
                 className="hidden"
                 id="file"
                 accept={EDITFT}
                 onChange={this.handleChange} />
          <button className="btn btn-success"
                  onClick={this.handleClick}>匯入</button>
        </div>
    )
  }
}

export default DataInput