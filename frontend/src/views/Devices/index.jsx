import React from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import WifiTetheringIcon from '@material-ui/icons/WifiTethering';
import CircularProgress from '@material-ui/core/CircularProgress';
import DisplaysTable from 'components/DisplaysTable';
// import DevicesTable from 'components/DevicesTable';
import DeviceConfigDialog from 'components/DeviceConfigDialog';
import DisplayConfigDialog from 'components/DisplayConfigDialog';
import {
    addDevice,
    // deleteDevice,
    updateDeviceConfig,
    fetchDeviceList,
    findWLEDDevices,
} from 'modules/devices';
import { deleteDisplay, fetchDisplayList, updateDisplayConfig, addDisplay } from 'modules/displays';

const styles = theme => ({
    cardResponsive: {
        width: '100%',
        overflowX: 'auto',
    },
    button: {
        size: 'large',
        margin: theme.spacing(1),
    },
    dialogButton: {
        float: 'right',
    },
});

class DevicesView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addDialogOpened: false,
            addDisplayOpened: false,
            selectedDevice: {},
            selectedDisplay: {},
            searchDevicesLoading: false,
        };
    }
    componentDidMount() {
        const { fetchDeviceList, fetchDisplayList } = this.props;
        fetchDeviceList();

        fetchDisplayList();
    }

    openAddDeviceDialog = () => {
        this.setState({ selectedDevice: {}, addDialogOpened: true });
    };

    closeAddDeviceDialog = () => {
        this.setState({ selectedDevice: {}, addDialogOpened: false });
    };
    closeAddDisplayDialog = () => {
        this.setState({ selectedDisplay: {}, addDisplayOpened: false });
    };

    handleEditDevice = device => {
        this.setState({ selectedDevice: device, addDialogOpened: true });
    };
    handleEditDisplay = display => {
        console.log('11', display);
        this.setState({ selectedDisplay: display, addDisplayOpened: true });
    };
    handleFindDevices = () => {
        const { findWLEDDevices } = this.props;
        this.setState({ searchDevicesLoading: true });
        new Promise((resolve, reject) => {
            findWLEDDevices({ resolve, reject });
        }).then(() => {
            this.setState({ searchDevicesLoading: false });
        });
    };

    render() {
        const {
            classes,
            deviceList,
            displayList,
            deleteDisplay,
            schemas,
            addDevice,
            // deleteDevice,
            updateDeviceConfig,
            scanProgress,
        } = this.props;
        const { addDialogOpened, selectedDevice } = this.state;
        const { addDisplayOpened, selectedDisplay } = this.state;
        const helpText = `Ensure WLED Devices are on and connected to your WiFi.\n
                          If not detected, check WLED device mDNS setting. Go to:\n
                          WLED device ip > Config > WiFi Setup > mDNS Address \n`;
        console.log('GGGG', schemas);
        return (
            <>
                <Grid container spacing={2}>
                    {/* <Grid item xs={12} md={12}>
                        <Card>
                            <CardContent>
                                <Grid container direction="row" spacing={1} justify="space-between">
                                    <Grid item xs="auto">
                                        <Typography variant="h5">Devices</Typography>
                                        <Typography variant="body1" color="textSecondary">
                                            Manage devices connected to LedFx
                                        </Typography>
                                    </Grid>
                                    {!schemas.isLoading && (
                                        <>
                                            <Grid item>
                                                <Box
                                                    display="flex"
                                                    flexDirection="row"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                >
                                                    <CircularProgress
                                                        variant="determinate"
                                                        value={scanProgress * 10}
                                                        size={35}
                                                    />
                                                    <Tooltip title={helpText} interactive arrow>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            aria-label="Scan"
                                                            disabled={
                                                                this.state.searchDevicesLoading
                                                            }
                                                            className={classes.button}
                                                            onClick={this.handleFindDevices}
                                                            endIcon={<WifiTetheringIcon />}
                                                        >
                                                            Find WLED Devices
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title={
                                                            <ul style={{ padding: '0.5rem' }}>
                                                                <li>Split Devices into Segments</li>
                                                                <li>
                                                                    Combine multi Segments into
                                                                    Virtuals
                                                                </li>
                                                                <li>
                                                                    Re-order and Fine-tune Segements
                                                                </li>
                                                            </ul>
                                                        }
                                                        interactive
                                                        arrow
                                                    >
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            aria-label="Scan"
                                                            disabled={
                                                                this.state.searchDevicesLoading
                                                            }
                                                            className={classes.button}
                                                            onClick={this.handleFindDevices}
                                                            endIcon={<AddCircleIcon />}
                                                        >
                                                            Add Virtual Device
                                                        </Button>
                                                    </Tooltip>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        aria-label="Add"
                                                        className={classes.button}
                                                        onClick={this.openAddDeviceDialog}
                                                        endIcon={<AddCircleIcon />}
                                                    >
                                                        Add Device
                                                    </Button>
                                                    <DeviceConfigDialog
                                                        open={addDialogOpened}
                                                        onClose={this.closeAddDeviceDialog}
                                                        deviceTypes={schemas.deviceTypes}
                                                        onAddDevice={addDevice}
                                                        initial={selectedDevice}
                                                        onUpdateDevice={updateDeviceConfig}
                                                    />
                                                </Box>
                                            </Grid>
                                        </>
                                    )}
                                </Grid>

                                <DevicesTable
                                    items={deviceList}
                                    onDeleteDevice={deleteDevice}
                                    onEditDevice={this.handleEditDevice}
                                />
                            </CardContent>
                        </Card>
                    </Grid> */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Grid container direction="row" spacing={1} justify="space-between">
                                    <Grid item xs="auto">
                                        <Typography variant="h5">Devices</Typography>
                                        <Typography
                                            variant="body1"
                                            color="textSecondary"
                                        ></Typography>
                                    </Grid>
                                    {!schemas.isLoading && (
                                        <>
                                            <Grid item>
                                                <Box
                                                    display="flex"
                                                    flexDirection="row"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                >
                                                    <CircularProgress
                                                        variant="determinate"
                                                        value={scanProgress * 10}
                                                        size={35}
                                                    />
                                                    <Tooltip title={helpText} interactive arrow>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            aria-label="Scan"
                                                            disabled={
                                                                this.state.searchDevicesLoading
                                                            }
                                                            className={classes.button}
                                                            onClick={this.handleFindDevices}
                                                            endIcon={<WifiTetheringIcon />}
                                                        >
                                                            Find WLED Devices
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title={
                                                            <ul style={{ padding: '0.5rem' }}>
                                                                <li>Split Devices into Segments</li>
                                                                <li>
                                                                    Combine multi Segments into
                                                                    Virtuals
                                                                </li>
                                                                <li>
                                                                    Re-order and Fine-tune Segements
                                                                </li>
                                                            </ul>
                                                        }
                                                        interactive
                                                        arrow
                                                    >
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            aria-label="Scan"
                                                            className={classes.button}
                                                            onClick={() => alert('NOT YET BROO')}
                                                            endIcon={<AddCircleIcon />}
                                                        >
                                                            Add Virtual Device
                                                        </Button>
                                                    </Tooltip>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        aria-label="Add"
                                                        className={classes.button}
                                                        onClick={this.openAddDeviceDialog}
                                                        endIcon={<AddCircleIcon />}
                                                    >
                                                        Add Device
                                                    </Button>
                                                    <DeviceConfigDialog
                                                        open={addDialogOpened}
                                                        onClose={this.closeAddDeviceDialog}
                                                        deviceTypes={schemas.deviceTypes}
                                                        onAddDevice={addDevice}
                                                        initial={selectedDevice}
                                                        onUpdateDevice={updateDeviceConfig}
                                                    />
                                                    <DisplayConfigDialog
                                                        open={addDisplayOpened}
                                                        displays={schemas.displays}
                                                        onClose={this.closeAddDisplayDialog}
                                                        onAddDisplay={addDisplay}
                                                        initial={selectedDisplay}
                                                        onUpdateDisplay={updateDisplayConfig}
                                                    />
                                                </Box>
                                            </Grid>
                                        </>
                                    )}
                                </Grid>

                                <DisplaysTable
                                    items={displayList}
                                    deviceList={deviceList}
                                    onEditDevice={this.handleEditDevice}
                                    onDeleteDisplay={deleteDisplay}
                                    onEditDisplay={this.handleEditDisplay}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </>
        );
    }
}

export default connect(
    state => ({
        deviceList: state.devices.list,
        displayList: state.displays.list || [],
        schemas: state.schemas,
        scanProgress: state.devices.scanProgress,
    }),
    {
        addDevice,
        // deleteDevice,
        deleteDisplay,
        updateDeviceConfig,
        fetchDeviceList,
        findWLEDDevices,
        fetchDisplayList,
    }
)(withStyles(styles)(DevicesView));
