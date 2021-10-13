import React, { useEffect } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
//import Card from '@material-ui/core/Card';
//import CardHeader from '@material-ui/core/CardHeader';
//import CardContent from '@material-ui/core/CardContent';
import {
    AppBar,
    Checkbox,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    Select,
    Typography,
} from '@material-ui/core';
import { updatePlayerState } from 'modules/spotify';
//import AddCircleIcon from '@material-ui/icons/AddCircle';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import SkipNext from '@material-ui/icons/SkipNext';
import SkipPrevious from '@material-ui/icons/SkipPrevious';
//import CircularProgress from '@material-ui/core/CircularProgress';
import InfoIcon from '@material-ui/icons/Info';
import Link from '@material-ui/core/Link';
import { getScenes, activateScene } from 'modules/scenes';
import Moment from 'react-moment';
import moment from 'moment';
import Slider from '@material-ui/core/Slider';
import SpotifyWebPlayer from 'react-spotify-web-playback/lib';
//import uniqBy from 'lodash/uniqBy';

const styles = theme => ({
    appBar: {
        // top: 'auto',
        // bottom: 0,
        height: '15vh',
    },
    paper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    wrapper: {
        width: '100%',
    },
    container: {
        height: '100%',
    },
    albumImg: {
        maxWidth: '100px',
        maxHeight: '100%',
    },
});

const useStyles = makeStyles(theme => ({
    sceneButton: {
        size: 'large',
        margin: theme.spacing(1),
    },
    submitControls: {
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        height: '100%',
    },
}));

class SpotifyPlayer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sliderPositon: 0,
            includePosition: 'false',
            effects: '',
            play: false,
            player: {},
        };
    }

    createWebPlayer(token) {
        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'LedFX',
                getOAuthToken: cb => {
                    cb(token);
                },
            });

            player.addListener('initialization_error', ({ message }) => {
                console.error(message);
            });
            player.addListener('authentication_error', ({ message }) => {
                console.error(message);
            });
            player.addListener('account_error', ({ message }) => {
                console.error(message);
            });
            player.addListener('playback_error', ({ message }) => {
                console.error(message);
            });
            player.addListener('player_state_changed', state => {
                if (state !== null) {
                    if (state.position < 5 || state.position > 500) {
                        this.props.updatePlayerState(state);
                    }
                } else {
                    this.props.updatePlayerState({});
                }
            });
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });
            this.setState({ player: player });
            this.state.player.connect();
        };
        let script = window.document.createElement('script');
        script.setAttribute('src', 'https://sdk.scdn.co/spotify-player.js');
        window.document.head.appendChild(script);
    }

    handleSliderChange(e, v) {
        let percentage = v / 100;
        let progress = this.props.playerState.duration * percentage;
        this.state.player.seek(progress);
    }

    handleCheckChange = event => {
        this.setState({ ...this.state, [event.target.name]: event.target.checked });
    };

    handleSelectChange = event => {
        this.setState({ ...this.state, effects: event.target.value });
    };

    playMusic() {
        console.log('Working');
    }

    getTime(duration) {
        var milliseconds = Math.floor((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        return minutes + ':' + seconds;
    }

    componentDidMount() {
        if (
            Object.keys(this.props.playerState).length === 0 &&
            this.props.playerState.constructor == Object
        ) {
            console.log('creating player');
            this.createWebPlayer(this.props.accessToken);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.playerState.position !== prevProps.playerState.position) {
            this.setState({
                sliderPositon:
                    (this.props.playerState.position / this.props.playerState.duration) * 100,
            });
        }
    }

    render() {
        const { playerState, classes, scenes } = this.props;

        console.log(this.state.player);
        return Object.keys(playerState).length == 0 ? (
            <Link target="_blank" href="https://support.spotify.com/us/article/spotify-connect/">
                <Typography color="textPrimary">
                    Using Spotify Connect, select LedFX <InfoIcon></InfoIcon>
                </Typography>
            </Link>
        ) : (
            <AppBar
                color="default"
                position="relative"
                className={classes.appBar}
                style={{ height: '28vh' }}
            >
                <Grid
                    container
                    justify="space-around"
                    alignItems="center"
                    className={classes.container}
                >
                    <Grid container item xs={4}>
                        <img
                            style={{ alignItems: 'center' }}
                            className={classes.albumImg}
                            src={playerState.track_window.current_track.album.images[0].url}
                            alt=""
                        />
                        <div
                            style={{
                                width: '200px',
                                marginLeft: '2vw',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Typography align="center" variant="body1">
                                Song: {playerState.track_window.current_track.name}
                                <div>
                                    Artist: {playerState.track_window.current_track.artists[0].name}
                                </div>
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item container xs={7}>
                        <Grid item xs={6}>
                            <FormControl className={classes.formControl}>
                                <InputLabel id="select">Scenes</InputLabel>
                                <Select
                                    value={this.state.effects}
                                    color="primary"
                                    onChange={e => this.handleSelectChange(e)}
                                    labelId="select"
                                >
                                    {scenes.length &&
                                        scenes.map((s, i) => (
                                            <option value={s.id} key={i}>
                                                {s.name}
                                            </option>
                                        ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} justify="center">
                            <div style={{ flex: 1, width: '100%' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    {playerState.paused === false ? (
                                        <Moment interval={1000} format="mm:ss" durationFromNow>
                                            {moment().add(playerState.position * -0.001, 's')}
                                        </Moment>
                                    ) : (
                                        this.getTime(playerState.position)
                                    )}

                                    <Slider
                                        style={{ width: '70%' }}
                                        aria-labelledby="continuous-slider"
                                        value={this.state.sliderPositon}
                                        onChange={this.handleSliderChange.bind(this)}
                                        min={1}
                                        max={100}
                                    />
                                    {this.getTime(playerState.duration)}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                                    <Button
                                        style={{ marginRight: '1.8rem' }}
                                        color="primary"
                                        variant="contained"
                                        onClick={() => {
                                            this.state.player.previousTrack();
                                        }}
                                    >
                                        <SkipPrevious />
                                    </Button>
                                    {playerState.paused === true ? (
                                        <Button
                                            style={{ marginRight: '1.8rem' }}
                                            color="primary"
                                            variant="contained"
                                            onClick={() => {
                                                this.state.player.togglePlay();
                                            }}
                                        >
                                            <PlayArrow />
                                        </Button>
                                    ) : (
                                        <Button
                                            style={{ marginRight: '1.8rem' }}
                                            color="primary"
                                            variant="contained"
                                            onClick={() => {
                                                this.state.player.togglePlay();
                                            }}
                                        >
                                            <Pause />
                                        </Button>
                                    )}
                                    <Button
                                        style={{ marginRight: '1.8rem' }}
                                        color="primary"
                                        variant="contained"
                                        onClick={() => {
                                            this.state.player.nextTrack();
                                        }}
                                    >
                                        <SkipNext />
                                    </Button>
                                </div>
                            </div>
                        </Grid>

                        <Grid container item xs={6} justify="center">
                            <Typography align="center" variant="body1">
                                <div>
                                    Track Position: .
                                    {playerState.paused === false ? (
                                        <Moment interval={1000} format="mm:ss" durationFromNow>
                                            {moment().add(playerState.position * -0.001, 's')}
                                        </Moment>
                                    ) : (
                                        <Moment interval={0} format="mm:ss" durationFromNow>
                                            {moment().add(playerState.position * -0.001, 's')}
                                        </Moment>
                                    )}
                                </div>
                            </Typography>
                            <div>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            color="primary"
                                            checked={this.state.includePosition}
                                            onChange={e => this.handleCheckChange(e)}
                                            name="includePosition"
                                        />
                                    }
                                    label="Include Track Position"
                                />
                            </div>
                            <Button color="primary" variant="contained">
                                Add Trigger
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </AppBar>
        );
    }
}

export default connect(
    state => ({
        playerState: state.spotify.playerState,
        accessToken: state.spotify.accessToken,
        scenes: state.scenes.list,
    }),
    { updatePlayerState }
)(withStyles(styles)(SpotifyPlayer));
