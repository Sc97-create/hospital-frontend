import { Col, Dropdown, Form, Input, Row, Select, Space, Tag, Tooltip } from "antd";
import { useState } from "react";
import {
    DownOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import './first-step-appointment.css'
const { Option } = Select;
const handleChange = (value: string) => {
    console.log(`selected ${value}`);
};
function FirstStep() {
    const [form] = Form.useForm();
    const [SymInput, setSympInput] = useState('');
    const [showSympAll, setSympShowAll] = useState(false);
    const departments = [
        { label: 'Cardiology', value: 'cardiology' },
        { label: 'Neurology', value: 'neurology' },
        { label: 'Orthopedics', value: 'orthopedics' },
        { label: 'Pediatrics', value: 'pediatrics' },
        { label: 'Dermatology', value: 'dermatology' },
    ];
    // const [showCond, setCondShowAll] = useState(false);
    // const [conditionTags, setConditionTag] = useState<string[]>([])
    // const [CondInput, setCondInput] = useState('')
    const [symptomtags, setSymptomTags] = useState<string[]>([])
    const removeSymptomTag = (removedTag: string) => {
        setSymptomTags(symptomtags.filter(tag => tag !== removedTag));

    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && SymInput.trim()) {
            e.preventDefault();
            if (!symptomtags.includes(SymInput.trim())) {
                setSymptomTags([...symptomtags, SymInput.trim()]);
            }
            setSympInput('');
        }

    };
    const displaySympTags = showSympAll ? symptomtags : symptomtags.slice(0, 2);
    //const displayCondTags = showCond ? conditionTags : conditionTags.slice(0, 2);
    return (
        <>
            <Form
                layout='vertical'
                form={form}
            >
                <Row gutter={[0, 0]} >
                    <Col span={12}>
                        <Form.Item label="First Name" className='first-name-label'>
                            <Input placeholder="what we call you" className='input-form-layout' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Last Name">
                            <Input placeholder="we need it for reference" className='input-form-layout' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Age">
                            <Input type="number" placeholder="are you 21?" className='input-form-layout' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='Phone number'>
                            <Input type='tel' placeholder='we are trying to reach you' maxLength={10} className='input-form-layout' />
                        </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                        <Form.Item label='Gender' name="gender" >
                            <Select
                                className='gender-form-layout'
                                onChange={handleChange}
                                placeholder='its upto you'
                                options={[
                                    { value: 'female', label: 'Female' },
                                    { value: 'male', label: 'Male' },
                                    { value: 'not prefer to say', label: 'Not Prefer To Say' },

                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='Email ID'>
                            <Input placeholder='we want to notify you' type='email' className='input-form-layout' />
                        </Form.Item>
                    </Col>
                     <Col span={12}>
                        <Form.Item
                            label="Department"
                            name="department"
                            rules={[{ required: true, message: 'Please select a department!' }]}
                        >
                            <Select
                                placeholder="Select Department"
                                className="dropdown-input-class"
                                showSearch
                                optionFilterProp="children"
                                placement="bottomLeft"
                            >
                                {departments.map((dept) => (
                                    <Option key={dept.value} value={dept.value}>
                                        {dept.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='Assign Doctor' >
                            <Input className='input-form-layout' suffix={<SearchOutlined />} />
                        </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                        <Form.Item label='Symptoms'>
                            <Input
                                placeholder="for ex: fever"
                                value={SymInput}
                                onChange={e => setSympInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className='input-form-layout'
                            />
                            <div className='tag-wrapper'>
                                {displaySympTags.map(tag => (
                                    <Tag
                                        key={tag}
                                        closable
                                        onClose={() => removeSymptomTag(tag)}
                                        className='tag-layout'
                                    >
                                        {tag}
                                    </Tag>
                                ))}

                                {!showSympAll && symptomtags.length > 2 && (
                                    <Tooltip
                                        placement='bottom'
                                        style={{ textAlign: 'left' }}
                                        title={symptomtags.slice(2).join(', ')}
                                    >
                                        <Tag
                                            className='tag-layout'
                                            onClick={() => setSympShowAll(true)}
                                        >
                                            +{symptomtags.length - 2} more
                                        </Tag>
                                    </Tooltip>
                                )}
                            </div>

                        </Form.Item>
                    </Col>

                   <Col span={12}>
                        <Form.Item label="Weight">
                            <Input type="number" placeholder="don't be overweight" className='input-form-layout' />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </>
    )
}
export default FirstStep