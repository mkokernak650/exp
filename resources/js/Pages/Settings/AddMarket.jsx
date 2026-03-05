import { React, useState } from "react";
import Layout from "../Layout/Layout";
import { Button, Typography, Input, message } from "antd";
import { Row, Col } from "antd";
import { Helmet } from "react-helmet";
import axios from "axios";

const AddMarket = () => {
  const [values, setValues] = useState();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((oldValues) => ({
      ...oldValues,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post(route("store-market"), values).then((res) => {
      setLoading(false);
      if (res.status === 200) {
        message.success(res.data.msg);
      }
    });
  };

  return (
    <>
      <Helmet title="Call Logs Report" />
      <div style={{ display: 'grid', width: '500px', margin: 'auto', marginTop: '2rem', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', borderRadius: '4px', background: '#fff' }}>
        <Typography.Title level={5} style={{ textAlign: 'center', marginBottom: '35px' }}>
          Add Market
        </Typography.Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div>
                <label>Market</label>
                <Input
                  name="market"
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

AddMarket.layout = (page) => <Layout title="Add Market">{page}</Layout>;
export default AddMarket;
