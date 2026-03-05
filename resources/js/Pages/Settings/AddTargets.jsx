import { React, useState } from "react";
import Layout from "../Layout/Layout";
import { Button, Typography, Select, Input } from "antd";
import { Row, Col } from "antd";
import { usePage } from "@inertiajs/inertia-react";
import axios from "axios";
import { Helmet } from "react-helmet";
import MultiSelect from "react-multiple-select-dropdown-lite";
import "react-multiple-select-dropdown-lite/dist/index.css";
import toast from 'react-hot-toast'

const AddTargets = () => {
  const [values, setValues] = useState();
  const [loading, setLoading] = useState(false);
  const { allCustomers, allTargetNames } = usePage().props;

  const options = allTargetNames.map((item) => ({
    label: item.target_name,
    value: item.target_name,
  }));

  const [target, setTarget] = useState();
  const targetHandleChange = (val, key) => {
    setTarget({ [key]: val });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((oldValues) => ({
      ...oldValues,
      [name]: value,
    }));
  };

  const finalData = {
    ...target,
    ...values,
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(route("add.target"), finalData)
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          toast.success(res.data.msg);
          e.target.reset();
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  return (
    <>
      <Helmet title="Add Target" />
      <div style={{ display: 'grid', width: '500px', margin: 'auto', marginTop: '2rem', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', borderRadius: '4px', background: '#fff' }}>
        <Typography.Title level={5} style={{ textAlign: 'center', marginBottom: '35px' }}>
          Add Target
        </Typography.Title>
        <form onSubmit={handleSubmit} className="add-target">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Select
                placeholder="Select Customer"
                onChange={(value) => handleChange({ target: { name: 'Customer', value } })}
                style={{ width: '100%' }}
              >
                {allCustomers.map((option, indx) => (
                  <Select.Option key={indx} value={option.customer_name}>
                    {option.customer_name}
                  </Select.Option>
                ))}
              </Select>
            </Col>

            <Col span={24}>
              <MultiSelect
                name="Ringba_Targets_Name"
                onChange={(val) =>
                  targetHandleChange(val, "Ringba_Targets_Name")
                }
                options={options}
                placeholder="Select Targets"
                style={{ width: '100%' }}
              />
            </Col>

            <Col span={24}>
              <div>
                <label>Description</label>
                <Input
                  name="Description"
                  onChange={handleChange}
                  type="text"
                  required
                  style={{ width: '100%' }}
                />
              </div>
            </Col>
            <Col span={24}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
            </Col>
          </Row>
        </form>
      </div>
    </>
  );
};

AddTargets.layout = (page) => <Layout title="Add Targets">{page}</Layout>;
export default AddTargets;
