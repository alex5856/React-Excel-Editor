import React, {Component, PropTypes} from 'react'
import DragDropFile from './share/DragDropFile'
import DataInput from './share/DataInput'

class Edit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      index: null ,
      edit: null,
      text : null,
      sheetNames: [],
      data: [],
      cols: []
    };
    this.handleFile = this.handleFile.bind(this)
    this.exportFile = this.exportFile.bind(this)
    this.onEditChange = this.onEditChange.bind(this)
    this.onTextChange = this.onTextChange.bind(this)
  }

  handleFile(file) {
    /* Boilerplate to set up FileReader */

    const reader = new FileReader()
    let rABS = typeof FileReader !== "undefined" && (FileReader.prototype||{}).readAsBinaryString
    // console.log(rABS)

    reader.onload = (e) => {

      /* Parse data */
      // const bstr = e.target.result
      let bstr = e.target.result

      if(!rABS) bstr = new Uint8Array(bstr)

      //const wb = XLSX.read(bstr, {type:'binary'})
      const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array'})

      const SheetLen = wb.SheetNames.length
      const SheetData = []
      const SheetNames = []
      const Sheet = []
      const sref = []

      for (var i = 0; i < SheetLen; i++) {
        SheetNames[i] = wb.SheetNames[i]
        Sheet[i] = wb.Sheets[SheetNames[i]]
        SheetData[i] = XLSX.utils.sheet_to_json(Sheet[i], { header:1 })
        sref[i] = make_cols(Sheet[i]['!ref'])
      };


      /* Update state */
      this.setState({
        sheetNames: SheetNames,
        data: SheetData,
        cols: sref
      });
    };

    if (!FileReader.prototype.readAsBinaryString) {
        reader.readAsArrayBuffer(file)
    }
    else {
      reader.readAsBinaryString(file)
    }
  }

  exportFile() {
    let wsa = ''
    let wba = ''
    let sheetName = ''
    wba = XLSX.utils.book_new()

    this.state.data.map((elem, i) => {
      sheetName = this.state.sheetNames[i]
      wsa = XLSX.utils.aoa_to_sheet(elem)
      XLSX.utils.book_append_sheet(wba, wsa, sheetName)
    })

    /* generate XLSX file */
    const wbout = XLSX.write(wba, {type:"binary", bookType:"xlsx"})

    const FileSaver = require('file-saver')
    /* send to client */
    FileSaver.saveAs(new Blob([s2ab(wbout)],
                    {type:"application/octet-stream"}),
                    "edit.xlsx")
  }

  onTextChange(e) {
    this.setState({
      text: e.target.value
    })
  }

  onEdit(i, dataIndex, key) {
    this.setState({
      index: {
          i1: i,
          i2: dataIndex,
          i3: key
      },
      edit: true
    })
  }

  onSave(i, dataIndex, key) {
    let eText = document.getElementsByClassName("eText")[0]
    let text = eText.value
    let sData = this.state.data
    let sCols = this.state.cols
    sData[i][key][dataIndex] = text

    this.setState({
      index: {
          i1: i,
          i2: dataIndex,
          i3: key
      },
      edit: false,
      text: text,
      data: sData,
      cols: sCols
    })
  }

  onEditChange() {
    let editMode = null
    this.state.edit ? editMode : editMode = true
    this.setState({
      edit: editMode
    })
  }

  render() {

    let DivStyle = {
      padding: '30px 15px 20px 15px'
    }

    let DivDragDropFile = {
      height: '200px',
      border: '2px dashed #ccc',
      margin: '50px auto',
      textAlign: 'center',
      fontSize: '36px',
      lineHeight: '180px'
    }

    let _cols = this.state.cols
    let _data = this.state.data
    let sheetNames = this.state.sheetNames
    let _Index = this.state.index

    let content = [
      <div className="container">
        <h1 className="text-center">Excel 線上編輯</h1>
            <div className="row">
                <div className="col-xs-12" style={DivStyle}>
                    <DataInput handleFile={this.handleFile} />
                    {
                    <button disabled={!this.state.data.length}
                            className="btn btn-success"
                            onClick={this.exportFile}>匯出</button>
                    }
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12">
                    <div className="table-responsive">
                        <ul className="nav nav-tabs">
                        {
                          sheetNames.map((name, i) => (
                            i === 0 ?
                            <li className="active">
                              <a data-toggle="tab" href={'#'+ name}>{name}</a>
                            </li>
                            :
                            <li>
                              <a data-toggle="tab" href={'#'+ name}>{name}</a>
                            </li>
                          ))
                        }
                       </ul>
                       <div className="tab-content">
                       {
                         this.state.data.length === 0 ?
                         <div style={DivDragDropFile}>
                           <DragDropFile handleFile={this.handleFile}>
                            拖曳至此匯入檔案或點選匯入按鈕
                           </DragDropFile>
                         </div>
                         : null
                       }
                       {
                        sheetNames.map((name, i) => (
                            <div id={name} className={'tab-pane fade '+ styleChange(i)}>
                              <table className="table table-striped">
                                <thead>
                                  <tr>
                                  {
                                    _cols[i].map((c) => (
                                      <th style={{width: styleWidthChange(_cols[i].length)}} key={c.key}>{c.name}</th>
                                    ))
                                  }
                                  </tr>
                                </thead>
                                {
                                  <tbody>
                                    {
                                      _data[i].map((r,j) => (
                                        <tr key={j}>
                                        {
                                          _cols[i].map((c2 => (
                                            <td key={c2.key}>
                                            {
                                              this.state.edit && _Index.i1 === i && _Index.i2 === c2.key && _Index.i3 === j ?
                                              <div>
                                                {
                                                  r[c2.key].length > 25 ?
                                                  <textarea
                                                        rows="5"
                                                        className="eText"
                                                        onChange={this.onTextChange} >
                                                        {r[c2.key]}
                                                  </textarea>
                                                  :
                                                  <input type="text"
                                                         className="eText"
                                                         defaultValue={r[c2.key]}
                                                         onChange={this.onTextChange} />
                                                }
                                                <button className="btn-xs"
                                                        onClick={this.onSave.bind(this, i, c2.key, j)}>
                                                    <span className="glyphicon glyphicon-save" aria-hidden="true">儲存</span>
                                                </button>
                                              </div>
                                                :
                                                <p onClick={this.onEdit.bind(this, i, c2.key, j)}>
                                                { r[c2.key] }
                                                </p>
                                            }
                                            </td>
                                          )))
                                        }
                                        </tr>
                                      ))
                                    }
                                  </tbody>
                                }
                              </table>
                            </div>
                          ))
                       }
                       </div>
                    </div>
                </div>
            </div>
      </div>
    ]

    return (
      <div className="content">
        {content}
      </div>
    )
  }
}

export default Edit

/* see Browser download file example in docs */
function s2ab(s)/*:ArrayBuffer*/ {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf
}

function styleChange(i) {
  let r = i === 0 ? r = 'in active' : r = ''
  return r
}

function styleWidthChange (len) {
  let r = 100 / len + '%'
  return r
}

/* generate an array of column objects */
// const make_cols = refstr => Array(XLSX.utils.decode_range(refstr).e.c + 1).fill(0).map((x,i) => ({
//   name:XLSX.utils.encode_col(i), key:i
// }));

function make_cols(refstr) {

  let arr = Array(XLSX.utils.decode_range(refstr).e.c + 1)
  let arrLen = arr.length
  for (var i = 0; i < arrLen; i++) {
    arr[i] = 0
  }

  // return Array(XLSX.utils.decode_range(refstr).e.c + 1).fill(0).map(function (x, i) {
  return arr.map(function (x, i) {
    return {
      name: XLSX.utils.encode_col(i),
      key: i
    }
  })
}