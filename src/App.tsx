// Copyright Rohit Gadagkar
import React, { useState } from 'react';
import './App.css';
import logo from './images/logo.svg';
import SvgComponent2 from './components/SvgComponent2';
import { Card, Layout, Flex } from 'antd';
import SVGLoader from './components/SVGLoader';
import ControlPanel from './components/ControlPanel';


const { Header, Footer, Sider, Content } = Layout;

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  height: 64,
  paddingInline: 48,
  lineHeight: '64px',
  backgroundColor: 'hsl(30, 100%, 80%)',
};

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: 'hsl(359, 80%, 80%)',
  height: "calc(90vh - 55px)",
  overflow: 'hidden'
};

const siderStyle: React.CSSProperties = {
  textAlign: 'center',
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: 'hsl(207, 54%, 77%)',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: 'hsl(207, 54%, 77%)',
  overflow: 'hidden'
};

const layoutStyle = {
  borderRadius: 8,
  overflow: 'auto',
  width: 'calc(75% - 8px)',
  maxWidth: 'calc(75% - 8px)',
  height: '100vh'
};

const logoStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  animation: 'slideRight 5s infinite' // Define the duration and iteration count here
};

function App() {
  const [selectedSVGFile, setSelectedSVGFile] = useState<string>("");
  const [svgContent, setSvgContent] = useState<string>("");
  const [imgContent, setImgContent] = useState<string>("");
  const [selectedPath, setSelectedPath] = useState<SVGPathElement | null>(null);
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [strokeColor, setStrokeColor] = useState<string>('#000000'); // Initial color
  const [strokeDashedArray, setStrokeDashedArray] = useState<string>('none')

  const handleSVGFileChange = (svgContent: string, svgFileName: string) => {
    console.log(`handleSVGFileChange: file:${svgFileName} len: ${svgContent.length}`);
    setSelectedSVGFile(svgFileName);
    setSvgContent(svgContent);
    handleReset();
  }

  function handleImageChange(imgContent: string, imgFileName: string): void {
    console.log(`handleImageChange: file:${imgFileName} len: ${imgContent.length}`);
    setImgContent(imgContent);
  }

  const handleStrokeWidthChange = (value: number) => {
    // Update stroke width state
    setStrokeWidth(value);
  };

  const handleColorChange = (color: string) => {
    // Update stroke color state
    setStrokeColor(color);
  };


  const handleCheckboxChange = (value: boolean) => {
    // Update selected path stroke dash array setting
    setStrokeDashedArray(value ? '5,5' : 'none');
  }

  function handlePathSelected(pathElement: SVGPathElement|null): void {
    console.log('App: set selectedPath');
    setSelectedPath(pathElement);
    // Selected path can be toggled for example on toggling mouse click on a path
    if (pathElement !== null) {
      setStrokeDashedArray(pathElement.getAttribute('stroke-dasharray') ?? 'none');
      setStrokeColor(pathElement.getAttribute('stroke') ?? '#000000');
    } else {

    }
  }

  function handleReset(): void {
    setStrokeWidth(2);
    setStrokeColor('#000000');
    setStrokeDashedArray('none');
    //setSelectedPath(null);
  }

  

  return (
    <Layout style={layoutStyle}>
      <Header style={headerStyle}>
        <img src={logo} className="App-logo" alt="logo" style={logoStyle} />
      </Header>
      <Layout>
        <Sider style={siderStyle}>
          <ControlPanel
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            strokeDashedArray={strokeDashedArray}
            onCheckboxChange={handleCheckboxChange}
            onStrokeWidthChange={handleStrokeWidthChange}
            onColorChange={handleColorChange}
            onReset={handleReset}
          />
        </Sider>
        <Content >
          <SVGLoader onFileChange={handleSVGFileChange} onImageChange={handleImageChange} />


          {<SvgComponent2
            svgContent={svgContent}
            imgContent={imgContent}
            selectedPath={selectedPath}
            selectedPathAttributes={{ color: strokeColor, dasharray: strokeDashedArray, width: strokeWidth }}
            onPathSelected={handlePathSelected}
          />
          }

        </Content>
      </Layout>
      {
        /* <Footer style={footerStyle}>Footer</Footer>  */
      }
    </Layout>
  );
}

export default App;
