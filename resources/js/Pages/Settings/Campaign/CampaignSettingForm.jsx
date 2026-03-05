import { React, useState } from "react";
import Layout from "../../Layout/Layout";
import { Button, Typography, Select, Input } from "antd";
import { Row, Col } from "antd";
import { usePage } from "@inertiajs/inertia-react";
import axios from "axios";
import { Helmet } from "react-helmet";
import toast from 'react-hot-toast'

const CampaignSettingForm = () => {
  const [values, setValues] = useState();
  const [loading, setLoading] = useState(false);
  const { allCampaigns } = usePage().props;

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
    axios
      .post(route("campaign.setting.update"), values)
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          toast.success(res.data.msg);
        }
      })
      .catch((err) => {});
  };

  return (
    <>
      <Helmet title="Set Duration" />
      <div className="grid w-[500px] m-auto mt-8 p-10 shadow rounded bg-white">
        <Typography.Title level={5} className="text-center mb-[35px]">
          Set Duration
        </Typography.Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Select
                placeholder="Select Campaign"
                onChange={(value) => handleChange({ target: { name: 'campaign_id', value } })}
                className="w-full"
              >
                {allCampaigns.map((option, indx) => (
                  <Select.Option key={indx} value={option.id}>
                    {option.campaign_name}
                  </Select.Option>
                ))}
              </Select>
            </Col>

            <Col span={24}>
              <div>
                <label>Connection Duration (in Sec)</label>
                <Input
                  type="number"
                  name="connection_duration"
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>
            </Col>
            <Col span={24}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update
              </Button>
            </Col>
          </Row>
        </form>
      </div>
    </>
  );
};

CampaignSettingForm.layout = (page) => (
  <Layout title="Market Exception">{page}</Layout>
);
export default CampaignSettingForm;
