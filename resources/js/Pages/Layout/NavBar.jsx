import { Layout, Menu, Button, Divider, Dropdown } from 'antd'
import {
  MenuOutlined,
  LeftOutlined,
  ShopOutlined,
  PhoneOutlined,
  SettingOutlined,
  TeamOutlined,
  ReadOutlined,
  BarChartOutlined,
  UserOutlined,
  GlobalOutlined,
  CalendarOutlined,
  HistoryOutlined,
  DatabaseOutlined,
  UsergroupAddOutlined,
  EllipsisOutlined,
} from '@ant-design/icons'
import { Minus as MinusIcon } from 'react-feather'
import { InertiaLink } from '@inertiajs/inertia-react'
import { usePage } from '@inertiajs/inertia-react'
import { useEffect, useState, useMemo } from 'react'
import Logo from '../../../images/webform/logo.png'

const { Header, Sider, Content } = Layout
const drawerWidth = 280

export default function PersistentDrawerLeft(props) {
  const { url } = usePage()
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = window.localStorage.getItem('sidebar-drawer-open')
    return saved !== null ? saved === 'true' : true
  })

  const isCurrentRoute = (routeName) => {
    if (!routeName) return false
    try {
      return route().current(routeName)
    } catch (e) {
      return false
    }
  }

  const menuItems = [
    {
      key: 'ringba',
      icon: <GlobalOutlined />,
      label: 'Ringba',
      children: [
        {
          key: 'get.ringba.data.form',
          label: <InertiaLink href={route('get.ringba.data.form')}>Get Ringba Data</InertiaLink>,
        },
        {
          key: 'call-logs-report',
          label: <InertiaLink href={route('call-logs-report')}>Call Logs Report</InertiaLink>,
        },
        {
          key: 'archived-call-log-report',
          label: (
            <InertiaLink href={route('archived-call-log-report')}>
              Archived Call Logs Report
            </InertiaLink>
          ),
        },
        {
          key: 'pending-call-log-report',
          label: (
            <InertiaLink href={route('pending-call-log-report')}>
              Pending Call Logs Report
            </InertiaLink>
          ),
        },
        {
          key: 'get.exceptions',
          label: <InertiaLink href={route('get.exceptions')}>Exceptions</InertiaLink>,
        },
        {
          key: 'billed-call-log-report',
          label: (
            <InertiaLink href={route('billed-call-log-report')}>
              Billed Call Logs Report
            </InertiaLink>
          ),
        },
      ],
    },
    {
      key: 'generate-reports',
      icon: <ReadOutlined />,
      label: 'Generate Reports',
      children: [
        {
          key: 'ecommerce.report',
          label: <InertiaLink href={route('ecommerce.report')}>Phone and Coupon Codes</InertiaLink>,
        },
        {
          key: 'ringba.reports',
          label: <InertiaLink href={route('ringba.reports')}>Ringa Reports</InertiaLink>,
        },
        {
          key: 'custom.email',
          label: <InertiaLink href={route('custom.email')}>Custom Email</InertiaLink>,
        },
        {
          key: 'send.campaign',
          label: <InertiaLink href={route('send.campaign')}>Roster Campaign</InertiaLink>,
        },
      ],
    },
    {
      key: 'pay-per-call',
      icon: <PhoneOutlined />,
      label: 'Pay Per Call Setup',
      children: [
        {
          key: 'campaign.setting.report',
          label: <InertiaLink href={route('campaign.setting.report')}>Campaign List</InertiaLink>,
        },
        {
          key: 'campaign.setting.form',
          label: <InertiaLink href={route('campaign.setting.form')}>Set Duration</InertiaLink>,
        },
        {
          key: 'annotation.create',
          label: <InertiaLink href={route('annotation.create')}>Create Annotations</InertiaLink>,
        },
        {
          key: 'market.exception.form',
          label: <InertiaLink href={route('market.exception.form')}>Add Exceptions</InertiaLink>,
        },
        {
          key: 'market.exception.report',
          label: (
            <InertiaLink href={route('market.exception.report')}>
              Market Exception Report
            </InertiaLink>
          ),
        },
        {
          key: 'targets',
          icon: <SettingOutlined />,
          label: 'Targets',
          children: [
            {
              key: 'target.form',
              label: <InertiaLink href={route('target.form')}>Add Target</InertiaLink>,
            },
            {
              key: 'target.report',
              label: <InertiaLink href={route('target.report')}>Targets</InertiaLink>,
            },
            {
              key: 'target_names.report',
              label: <InertiaLink href={route('target_names.report')}>Target Names</InertiaLink>,
            },
          ],
        },
      ],
    },
    {
      key: 'ecommerce',
      icon: <ShopOutlined />,
      label: 'Phone and Coupon Codes',
      children: [
        {
          key: 'ecommerce-campaigns.create',
          label: (
            <InertiaLink href={route('ecommerce-campaigns.create')}>Create Campaign</InertiaLink>
          ),
        },
        {
          key: 'ecommerce-campaigns.index',
          label: <InertiaLink href={route('ecommerce-campaigns.index')}>All Campaigns</InertiaLink>,
        },
        {
          key: 'ecommerce-sales.import',
          label: (
            <InertiaLink href={route('ecommerce-sales.import')}>Import Sales Report</InertiaLink>
          ),
        },
        {
          key: 'ecommerce-sales.index',
          label: <InertiaLink href={route('ecommerce-sales.index')}>Historical sales</InertiaLink>,
        },
      ],
    },
    {
      key: 'insertion-order',
      icon: <BarChartOutlined />,
      label: 'Insertion Order',
      children: [
        {
          key: 'ecommerce-affiliates.create',
          label: (
            <InertiaLink href={route('ecommerce-affiliates.create')}>
              Phone and Code Worksheet
            </InertiaLink>
          ),
        },
        {
          key: 'ecommerce-affiliates.index',
          label: (
            <InertiaLink href={route('ecommerce-affiliates.index')}>
              All Phone and Code Worksheets
            </InertiaLink>
          ),
        },
        {
          key: 'insertion.order.create',
          label: (
            <InertiaLink href={route('insertion.order.create')}>Create Insertion Order</InertiaLink>
          ),
        },
        {
          key: 'insertion.order',
          label: <InertiaLink href={route('insertion.order')}>All Insertion Orders</InertiaLink>,
        },
        {
          key: 'insertion.order.ringba.term.create',
          label: (
            <InertiaLink href={route('insertion.order.ringba.term.create')}>
              Create Pay Per Call IO
            </InertiaLink>
          ),
        },
        {
          key: 'insertion.order.ringba',
          label: (
            <InertiaLink href={route('insertion.order.ringba')}>All Pay Per Call IO</InertiaLink>
          ),
        },
      ],
    },
    {
      key: 'affiliates',
      icon: <SettingOutlined />,
      label: 'Affiliates',
      children: [
        {
          key: 'add.affiliate',
          label: <InertiaLink href={route('add.affiliate')}>Add Affiliate</InertiaLink>,
        },
        {
          key: 'affiliate.report',
          label: <InertiaLink href={route('affiliate.report')}>Affiliate Report</InertiaLink>,
        },
        {
          key: 'archived.affiliates',
          label: <InertiaLink href={route('archived.affiliates')}>Archived Affiliates</InertiaLink>,
        },
        {
          key: 'corporation',
          icon: <SettingOutlined />,
          label: 'Corporation',
          children: [
            {
              key: 'broadcast_group_names.form',
              label: <InertiaLink href={route('broadcast_group_names.form')}>Add Broadcast Group Names</InertiaLink>,
            },
            {
              key: 'broadcast_group_names.report',
              label: <InertiaLink href={route('broadcast_group_names.report')}>Broadcast Group Names</InertiaLink>,
            },
            {
              key: 'mso_names.form',
              label: <InertiaLink href={route('mso_names.form')}>Add Mso Names</InertiaLink>,
            },
            {
              key: 'mso_names.report',
              label: <InertiaLink href={route('mso_names.report')}>Mso Names</InertiaLink>,
            },
            {
              key: 'network_names.form',
              label: <InertiaLink href={route('network_names.form')}>Add Network Names</InertiaLink>,
            },
            {
              key: 'network_names.report',
              label: <InertiaLink href={route('network_names.report')}>Network Names</InertiaLink>,
            },
          ],
        },
      ],
    },
    {
      key: 'customers',
      icon: <TeamOutlined />,
      label: 'Customers',
      children: [
        {
          key: 'add.customer',
          label: <InertiaLink href={route('add.customer')}>Add Customer</InertiaLink>,
        },
        {
          key: 'customer.report',
          label: <InertiaLink href={route('customer.report')}>Customer Report</InertiaLink>,
        },
        {
          key: 'archived.customers',
          label: <InertiaLink href={route('archived.customers')}>Archived Customers</InertiaLink>,
        },
      ],
    },
    {
      key: 'database',
      icon: <DatabaseOutlined />,
      label: 'Database',
      children: [
        {
          key: 'zipcode.television.market',
          label: (
            <InertiaLink href={route('zipcode.television.market')}>
              TV Markets By Zip Codes
            </InertiaLink>
          ),
        },
        {
          key: 'zipcode.data',
          label: <InertiaLink href={route('zipcode.data')}>Telephone and Zip Codes</InertiaLink>,
        },
        {
          key: 'add.tv.households',
          label: <InertiaLink href={route('add.tv.households')}>Add TV Households</InertiaLink>,
        },
        {
          key: 'tv.households.report',
          label: (
            <InertiaLink href={route('tv.households.report')}>TV Households Report</InertiaLink>
          ),
        },
      ],
    },
    {
      key: 'calendar',
      icon: <CalendarOutlined />,
      label: 'Calendar',
      children: [
        {
          key: 'add.broadcast.month',
          label: <InertiaLink href={route('add.broadcast.month')}>Add Broadcast Month</InertiaLink>,
        },
        {
          key: 'broadcast.month.report',
          label: (
            <InertiaLink href={route('broadcast.month.report')}>Broadcast Month Report</InertiaLink>
          ),
        },
        {
          key: 'add.broadcast.week',
          label: <InertiaLink href={route('add.broadcast.week')}>Add Broadcast Week</InertiaLink>,
        },
        {
          key: 'broadcast.week.report',
          label: (
            <InertiaLink href={route('broadcast.week.report')}>Broadcast Week Report</InertiaLink>
          ),
        },
      ],
    },
    {
      key: 'webform.reports',
      icon: <BarChartOutlined />,
      label: <InertiaLink href={route('webform.reports')}>Webform Reports</InertiaLink>,
    },
    {
      key: 'activity.log',
      icon: <HistoryOutlined />,
      label: <InertiaLink href={route('activity.log')}>Activity Log</InertiaLink>,
    },
    {
      key: 'users',
      icon: <UsergroupAddOutlined />,
      label: 'Users',
      children: [
        {
          key: 'user.create',
          label: <InertiaLink href={route('user.create')}>Add User</InertiaLink>,
        },
        {
          key: 'user.index',
          label: <InertiaLink href={route('user.index')}>Show User</InertiaLink>,
        },
      ],
    },
  ]

  const withLinePrefix = (label) => (
    <span className="flex items-center gap-2">
      <MinusIcon size={14} strokeWidth={2} />
      <span>{label}</span>
    </span>
  )

  const applyLinePrefixToChildren = (items, hasParent = false) =>
    items.map((item) => ({
      ...item,
      label: hasParent ? withLinePrefix(item.label) : item.label,
      ...(item.children ? { children: applyLinePrefixToChildren(item.children, true) } : {}),
    }))

  const styledMenuItems = applyLinePrefixToChildren(menuItems)

  const findSelectedAndOpenKeys = () => {
    const selectedKeys = []
    const openKeys = []

    const findInItems = (items, parentKeys = []) => {
      for (const item of items) {
        if (item.children) {
          findInItems(item.children, [...parentKeys, item.key])
        } else if (isCurrentRoute(item.key)) {
          selectedKeys.push(item.key)
          openKeys.push(...parentKeys)
        }
      }
    }
    findInItems(menuItems)
    return { selectedKeys, openKeys }
  }

  const rootSubmenuKeys = useMemo(
    () => menuItems.filter((item) => item.children).map((item) => item.key),
    [],
  )

  const { selectedKeys, openKeys: initialOpenKeys } = useMemo(findSelectedAndOpenKeys, [url])
  const [openKeys, setOpenKeys] = useState(initialOpenKeys)

  const handleOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1)
    if (latestOpenKey && rootSubmenuKeys.includes(latestOpenKey)) {
      setOpenKeys(keys.filter((key) => !rootSubmenuKeys.includes(key) || key === latestOpenKey))
    } else {
      setOpenKeys(keys)
    }
  }

  useEffect(() => {
    const { openKeys: newOpenKeys } = findSelectedAndOpenKeys()
    setOpenKeys((prev) => [...new Set([...prev, ...newOpenKeys])])
  }, [url])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sidebar-drawer-open', String(open))
    }
  }, [open])

  const profileMenuItems = [
    {
      key: 'profile',
      label: <InertiaLink href={route('user.profile.index')}>My Profile</InertiaLink>,
    },
    {
      key: 'logout',
      label: (
        <InertiaLink method="post" href={route('logout')}>
          Logout
        </InertiaLink>
      ),
    },
  ]

  return (
    <Layout className="min-h-screen bg-white">
      <Header
        className="z-[1000] flex items-center px-4 py-0 bg-[#1976d2]"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: 64,
          lineHeight: '64px',
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
          marginLeft: open ? drawerWidth : 0,
          transition: 'all 0.2s ease',
        }}
      >
        {!open && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ color: '#fff', fontSize: 20 }} />}
            onClick={() => setOpen(true)}
            className="mr-4"
          />
        )}
        {!open && (
          <div className="logo">
            <img src={Logo} alt="consumer-exp-logo" />
          </div>
        )}
        <div className="flex-1" />
        <div className="hidden md:flex">
          <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight">
            <Button type="text" icon={<UserOutlined style={{ color: '#fff', fontSize: 20 }} />} />
          </Dropdown>
        </div>
      </Header>

      <Sider
        width={drawerWidth}
        trigger={null}
        collapsedWidth={0}
        collapsed={!open}
        className="sidebar-scroll overflow-auto h-screen fixed left-0 top-0 bottom-0 z-[1001] bg-white"
      >
        <div className="flex items-center justify-between px-2 py-0 !h-[64px]">
          <div className="logo">
            <InertiaLink href="/home">
              <img src={Logo} alt="consumer-exp-logo" />
            </InertiaLink>
          </div>
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={() => setOpen(false)}
            style={{ borderRadius: '100%', width: 40, height: 40 }}
          />
        </div>
        <Divider className="m-0" />
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={styledMenuItems}
          className="border-r-0"
        />
      </Sider>

      <Layout
        className="min-h-screen bg-white"
        style={{
          marginLeft: open ? drawerWidth : 0,
          transition: 'margin-left 0.2s ease',
        }}
      >
        <Content className="mt-16 p-6 min-h-[calc(100vh-64px)] bg-white">{props.main}</Content>
      </Layout>
    </Layout>
  )
}
