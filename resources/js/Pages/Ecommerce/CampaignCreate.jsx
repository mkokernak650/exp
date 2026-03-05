import { React, useState } from "react";
import Layout from "../Layout/Layout";
import { Button, Input, Row, Col, Typography } from "antd";
import axios from "axios";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
import { usePage } from "@inertiajs/inertia-react";
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const { Title } = Typography;
const { TextArea } = Input;

const CampaignCreate = () => {
  const defaultState = {
    campaign_name: "",
    customer_id: "",
    description: "",
    length_url: "",
  };
  const [values, setValues] = useState(defaultState);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();
  const [responseType, setResponseType] = useState();
  const { customers } = usePage().props

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((oldValues) => ({ ...oldValues, [name]: value }));
  };

  const headers = {
    headers: { Accept: "application/json" },
  };

  const customersOption = customers.map(customer => ({
    value: customer.id.toString(),
    label: customer.customer_name,
  }))

  const CustomerHandleChange = (value) => {
    setValues((oldValues) => ({ ...oldValues, customer_id: value }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(route("ecommerce-campaigns.store"), values, headers)
      .then((res) => {
        setLoading(false);
        setValues(defaultState);
        toast.success(res.data.msg);
      })
      .catch((err) => {
        let errors = "";
        if (err.response.data?.errors) {
          Object.values(err.response.data?.errors).map((error) => {
            errors += error[0] + "\n";
          });
        } else if (err.response.data?.msg) {
          errors = err.response.data.msg;
        }
        setLoading(false);
        toast.error(errors);
      });
  };

  return (
    <>
      <Helmet title="Create Campaign" />
      <div className="grid w-[500px] m-auto mt-8 p-10 grow min-h-[500px] shadow-md rounded-lg bg-white">
        <Title level={5} className="text-center mb-[35px]">
          Create Campaign
        </Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <div>
                <label>Campaign Name</label>
                <Input
                  value={values?.campaign_name}
                  id="campaign_name"
                  type="text"
                  name="campaign_name"
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>
            </Col>

            <Col span={24}>
              <MultiSelect
                singleSelect
                placeholder="Select Customer"
                options={customersOption}
                defaultValue={values.customer_id}
                onChange={value => CustomerHandleChange(value)}
                className="w-full"
              />
            </Col>

            <Col span={24}>
              <div>
                <label>Description</label>
                <TextArea
                  name="description"
                  onChange={handleChange}
                  value={values?.description}
                  spellCheck
                  className="w-full"
                  rows={4}
                />
              </div>
            </Col>

            <Col span={24}>
              <div>
                <label>Length and URL</label>
                <TextArea
                  name="length_url"
                  onChange={handleChange}
                  value={values?.length_url}
                  spellCheck
                  className="w-full"
                  rows={3}
                />
              </div>
            </Col>

            <Col span={24}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save
              </Button>
            </Col>
          </Row>
        </form>
      </div>
    </>
  );
};

CampaignCreate.layout = (page) => (
  <Layout title="E-commerce Campaign Create">{page}</Layout>
);
export default CampaignCreate;
