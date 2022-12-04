import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import PauseRounded from "@mui/icons-material/PauseRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import FastForwardRounded from "@mui/icons-material/FastForwardRounded";
import FastRewindRounded from "@mui/icons-material/FastRewindRounded";
import VolumeUpRounded from "@mui/icons-material/VolumeUpRounded";
import VolumeDownRounded from "@mui/icons-material/VolumeDownRounded";
import { Fab, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";



const Widget = styled("div")(({ theme }) => ({
  padding: 16,
  borderRadius: 16,
  width: "80%",
  maxWidth: "100%",
  margin: "auto",
  position: "relative",
  zIndex: 1,
  backgroundColor:
    theme.palette.mode === "dark" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.4)",
  backdropFilter: "blur(40px)",
}));

const TinyText = styled(Typography)({
  fontSize: "0.75rem",
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
});

export default function MusicPlayerSlider() {
  //console.log('レンダリングされました！');

  //-----------------Testing--------------------

  const [audioState, setAudioState] = useState(true);
  const audioRef = useRef();
  const inputRef = useRef(null);

  //let startTime
  let stopTime, recordingTime;
  let playTimer;
  const [repeatingTimes, setRepeatingTimes] = useState(2);
  const [startTime, setStartTime] = React.useState();
  //const [stopTime, setStopTime] = React.useState();
  //const [recordingTime, setRecordingTime] = React.useState();
  const [teachingAudioPath, setTeachingAudioPath] = useState();
  const [teachingAudioName, setTeachingAudioName] =
    useState("ファイルを選択してください");

  useEffect(() => {

    //mimeTypeの確認
    /*
    const types = ["video/webm",
                  "audio/webm",
                  "video/webm;codecs=vp8",
                  "video/webm;codecs=daala",
                  "video/webm;codecs=h264",
                  "audio/webm;codecs=opus",
                  "video/mpeg",
                  "video/webm;codecs=vp9",
                  "audio/mp4",
                  "audio/3gpp"];

    for (var i in types) {
      console.log( types[i] + " をサポートしている？ " + (MediaRecorder.isTypeSupported(types[i]) ? "たぶん！" : "いいえ :("));
      //alert( types[i] + " をサポートしている？ " + (MediaRecorder.isTypeSupported(types[i]) ? "たぶん！" : "いいえ :("));
    }
    */

    //マイクへのアクセス権を取得
    const mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia) ? {
      getUserMedia(c) {
          return new Promise(((y, n) => {
              (navigator.mozGetUserMedia || navigator.webkitGetUserMedia).call(navigator, c, y, n);
          }));
      }
    } : null);

    mediaDevices.getUserMedia({
      video: false,
      audio: true
    })
    .then(function(stream) {
      audioRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      // 音声データを貯める場所
      let chunks = [];
      // 録音が終わった後のデータをまとめる
      audioRef.current.addEventListener("dataavailable", (ele) => {
        if (ele.data.size > 0) {
          chunks.push(ele.data);
        }
        // 音声データをセット
      });
      // 録音を開始したら状態を変える
      audioRef.current.addEventListener("start", () => {
        setAudioState(false);
      });
      // 録音がストップしたらchunkを空にして、録音状態を更新
      audioRef.current.addEventListener("stop", () => {
        const blob = new Blob(chunks /*, 'type': mimeType }*/);
        setAudioState(true);
        chunks = [];
        const recAudio = document.querySelector("#recAudio");
        //console.dir(recAudio)
        recAudio.src = window.URL.createObjectURL(blob);
      });
    })
    .catch(function(err) {
      console.log(err);
    });
  }, []);

  
  // 録音開始
  const handleStart = () => {
    audioRef.current.start();
  };

  // 録音停止
  const handleStop = () => {
    audioRef.current.stop();
  };

  
  //教材音声再生
  const audioStart = () => {
    const teachingAudio = document.querySelector("#teachingAudio");
    teachingAudio.play();
  };
  const audioStop = () => {
    const teachingAudio = document.querySelector("#teachingAudio");
    teachingAudio.pause();
  };

  //音源の時間を取得 => UIに反映
  const startTimer = () => {
    const teachingAudio = document.querySelector("#teachingAudio");
    setStartTime(teachingAudio.currentTime);
    setInterval(() => {
      const teachingAudio = document.querySelector("#teachingAudio");
      playTimer = setPosition(teachingAudio.currentTime);
    }, 100);
  };
  const stopTimer = () => {
    const teachingAudio = document.querySelector("#teachingAudio");
    stopTime = teachingAudio.currentTime;
    recordingTime = (stopTime - startTime) * 1000; //sleepのために*1000
    clearInterval(playTimer);
  };

  //sleep機能
  const sleep = (waitSec) => {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve();
      }, waitSec);
    });
  };

  //LastPlay機能
  const lastPlayStart = () => {
    audioStart();
    startTimer();
  };
  const lastPlayStop = async () => {
    audioStop();
    stopTimer();
    await sleep(500); //=====!!!!!=====
    handleStart(); //録音開始
    await sleep(recordingTime);
    handleStop(); //録音停止
    await sleep(1000); //=====!!!!!=====
    const recAudio = document.querySelector("#recAudio");
    recAudio.load();
    recAudio.play();
    await sleep(recordingTime);
    recAudio.pause();
  };

  //LastPlay複数回リピート
  const lastPlayStartRepeat = () => {
    console.log("1回目のリピート!!");
    startTimer();
    lastPlayStart();
  };
  const lastPlayStopRepeat = async () => {
    stopTimer();
    await lastPlayStop();
    console.log(
      `startTime:${startTime}, stopTime:${stopTime}, recordingTime:${
        recordingTime / 1000
      }`
    );
    //2回目以降のリピート
    for (let i = 1; i < repeatingTimes; i++) {
      console.log(`${i + 1}回目のリピート!!`);
      const teachingAudio = document.querySelector("#teachingAudio");
      teachingAudio.currentTime = startTime;
      await lastPlayStart();
      await sleep(recordingTime);
      await lastPlayStop();
    }
  };

  //音源の時間を最初に取得(audioタグのonLoadedMetaDataから呼び出し)
  const settingTime = () => {
    setDuration(Math.ceil(document.querySelector("#teachingAudio").duration));
  };

  //ファイルを選択
  const selectFile = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onload = () => {
      setTeachingAudioPath(reader.result);
      setTeachingAudioName(file.name);
    };
    reader.readAsDataURL(file); //<=ここから新しいイベントリス名を作れる？Reactではきびいかも?
  };

  // path更新後に教材の時間を取得
  useEffect(() => {
    console.log("副作用レンダリング");
    settingTime();
  }, [teachingAudioPath]);

  //リピート回数を変更・反映
  const repeatingTimesChange = (event) => {
    setRepeatingTimes(event.target.value);
  };

  //fileuploadButton
  const clickFileUploadButton = () => {
    inputRef.current.click();
  }

  //---------------Testing--------------------------------

  const theme = useTheme();
  const [duration, setDuration] = React.useState(0);
  const [position, setPosition] = React.useState(0);
  const [paused, setPaused] = React.useState(true);

  function formatDuration(value) {
    const minute = Math.floor(value / 60);
    const secondLeft = Math.ceil(value - minute * 60);
    return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
  }

  const mainIconColor = theme.palette.mode === "dark" ? "#fff" : "#000";
  const lightIconColor =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";

  return (
    <Box sx={{ width: "80%", overflow: "hidden" }}>
      <Widget>
        <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography noWrap letterSpacing={-0.25} sx={{ margin: "auto", textAlign: "center" }}>
              {teachingAudioName}
            </Typography>
        </Box>
        <Slider
          aria-label="time-indicator"
          size="small"
          value={position}
          min={0}
          step={1}
          max={duration}
          onChange={(_, value) => setPosition(value)}
          sx={{
            color: theme.palette.mode === "dark" ? "#fff" : "rgba(0,0,0,0.87)",
            height: 4,
            "& .MuiSlider-thumb": {
              width: 8,
              height: 8,
              transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
              "&:before": {
                boxShadow: "0 2px 12px 0 rgba(0,0,0,0.4)",
              },
              "&:hover, &.Mui-focusVisible": {
                boxShadow: `0px 0px 0px 8px ${
                  theme.palette.mode === "dark"
                    ? "rgb(255 255 255 / 16%)"
                    : "rgb(0 0 0 / 16%)"
                }`,
              },
              "&.Mui-active": {
                width: 20,
                height: 20,
              },
            },
            "& .MuiSlider-rail": {
              opacity: 0.28,
            },
          }}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: -2,
          }}
        >
          <TinyText>{formatDuration(position)}</TinyText>
          <TinyText>-{formatDuration(duration - position)}</TinyText>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: -1,
          }}
        >
          <IconButton aria-label="previous song">
            <FastRewindRounded fontSize="large" htmlColor={mainIconColor} />
          </IconButton>
          <IconButton
            aria-label={paused ? "play" : "pause"}
            onClick={
              paused
                ? () => {
                    lastPlayStartRepeat();
                    setPaused(!paused);
                  }
                : () => {
                    lastPlayStopRepeat();
                    setPaused(!paused);
                  }
            }
          >
            {paused ? (
              <PlayArrowRounded
                sx={{ fontSize: "3rem" }}
                htmlColor={mainIconColor}
              />
            ) : (
              <PauseRounded
                sx={{ fontSize: "3rem" }}
                htmlColor={mainIconColor}
              />
            )}
          </IconButton>
          <IconButton aria-label="next song">
            <FastForwardRounded fontSize="large" htmlColor={mainIconColor} />
          </IconButton>
        </Box>
        <Stack
          spacing={2}
          direction="row"
          sx={{ mb: 1, px: 1 }}
          alignItems="center"
        >
          <VolumeDownRounded htmlColor={lightIconColor} />
          <Slider
            aria-label="Volume"
            defaultValue={30}
            sx={{
              color:
                theme.palette.mode === "dark" ? "#fff" : "rgba(0,0,0,0.87)",
              "& .MuiSlider-track": {
                border: "none",
              },
              "& .MuiSlider-thumb": {
                width: 24,
                height: 24,
                backgroundColor: "#fff",
                "&:before": {
                  boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
                },
                "&:hover, &.Mui-focusVisible, &.Mui-active": {
                  boxShadow: "none",
                },
              },
            }}
          />
          <VolumeUpRounded htmlColor={lightIconColor} />
        </Stack>
        <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
          <InputLabel id="repeatTimes">リピート回数</InputLabel>
          <Select
            labelId="repeatTimes"
            id="repeatTimes"
            value={repeatingTimes}
            label="repeat"
            onChange={repeatingTimesChange}
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
          </Select>
        </FormControl>
        <input type="file" onChange={selectFile} ref={inputRef} hidden/>
        <InputLabel onClick={clickFileUploadButton}>
            <Fab color="primary" aria-label="add">
              <AddIcon />
            </Fab>
          </InputLabel>
      </Widget>
      {/*<WallPaper />*/}

      <audio
        id="teachingAudio"
        src={teachingAudioPath || "./audiomaterial/curry.mp3"}
        onLoadedMetadata={settingTime}
      ></audio>
      <audio id="recAudio"></audio>
    </Box>
  );
}
