// ControlPanel.tsx
import React from 'react';
import { Slider, ColorPicker, Flex, Checkbox, Button } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import './styles.css';

interface ControlPanelProps {
  strokeWidth: number;
  strokeDashedArray: string;
  strokeColor: string;
  onStrokeWidthChange: (value: number) => void;
  onCheckboxChange: (value: boolean) => void;
  onColorChange: (color: string) => void;
  onReset: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  strokeWidth,
  strokeDashedArray,
  strokeColor,
  onStrokeWidthChange,
  onCheckboxChange,
  onColorChange,
  onReset,
}) => {
  return (
    <Flex gap="middle" justify='center' vertical={true}>
      <h2>Controls</h2>
      <Slider
        value={strokeWidth}
        onChange={onStrokeWidthChange}
        min={1}
        max={10}
      />
      <Checkbox onChange={ e => onCheckboxChange(e.target.checked)} checked={(strokeDashedArray??'none')==='none'?false:true}>Toggle path dashed stroke</Checkbox>
      <ColorPicker onChange={c => onColorChange(c.toHexString())} value={strokeColor}  >
        <span className='ctrlpan-text'>Set path color: </span>
        <BgColorsOutlined style={{ fontSize: '20px', color: '#1677ff' }} />
      </ColorPicker>
      <Button type='primary' onClick={onReset}>Reset</Button>
    </Flex>
  );
};

export default ControlPanel;
